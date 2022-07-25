import Component from '@glimmer/component';
import Ember from 'ember';
import { schedule } from '@ember/runloop';
import { hash } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { registerDestructor, isDestroyed, isDestroying } from '@ember/destroyable';
import { waitFor, waitForPromise } from '@ember/test-waiters';
import { connectToParent, type Connection, type AsyncMethodReturns } from 'penpal';

import { formatFrom, type OutputError, type Format } from 'limber/utils/messaging';

import { compileTopLevelComponent } from './create-top-level-component'

import type { ComponentLike } from '@glint/template';
import type RouterService from '@ember/routing/router-service';

interface Signature {
  Blocks: {
    default: [{
      component: ComponentLike | undefined;
    }]
  }
}

interface ParentMethods {
  ready: () => void;
  error: (error: OutputError) => void;
  beginCompile: () => void;
  success: () => void;
  finishedRendering: () => void;
}

async function setupEvents(context: Compiler, { onReceiveText, onConnect }: {
  onReceiveText: (text: string) => void,
  onConnect: (parent: AsyncMethodReturns<ParentMethods>) => void,
}) {
  let connection = connectToParent<ParentMethods>({
    methods: {
      update(format: Format, text: string) {
        onReceiveText(text);
      }
    }
  });

  context.connection = connection;

  registerDestructor(context, () => connection.destroy());

  let parent = await connection.promise;
  onConnect(parent);

  if (isDestroyed(context) || isDestroying(context)) return;

  /**
    * This app now can't render again, so we need to tell the host frame to re-load the output frame
    */
  Ember.onerror = (error: any) => parent.error({ error, unrecoverable: true });

  const handleError = (error: any) => parent.error({ error: error.message || error });

  window.addEventListener('error', handleError);

  registerDestructor(context, () => window.removeEventListener('error', handleError));

  await parent.ready();

  return connection;
}


/**
  * The Receiving Component is Limber::FrameOutput
  */
export default class Compiler extends Component<Signature> {
  @service declare router: RouterService;

  @tracked component?: ComponentLike;
  @tracked error: string | null = null;
  @tracked errorLine: number | null = null;
  @tracked template?: unknown;

  declare connection: Connection<ParentMethods>;
  declare parentFrame: AsyncMethodReturns<ParentMethods>;

  constructor(owner: unknown, args: any) {
    super(owner, args);

    waitForPromise(setupEvents(this, {
      onReceiveText: (text: string) => this.makeComponent(text),
      onConnect: (parent) => this.parentFrame = parent,
    }));
  }

  get format() {
    let requested = this.router.currentRoute.queryParams.format

    return formatFrom(requested);
  }


  @action
  @waitFor
  async makeComponent(text: string) {
    console.debug(`Making top-level component with format: ${this.format}`);

    await compileTopLevelComponent(text, {
      format: this.format,
      onCompileStart: async () => {
        await  (this.parentFrame.beginCompile());
      },
      onSuccess: async (component) => {
        if (!component) {
          await (this.parentFrame.error({ error: 'could not build component' }));
          return;
        }

        if (isDestroyed(this) || isDestroying(this)) return;
        this.component = component;

        await (this.parentFrame.success())

        schedule('afterRender', () => {
          if (isDestroyed(this) || isDestroying(this)) return;

          this.parentFrame.finishedRendering();
        });
      },
      onError: async (error: string) => {
        await (this.parentFrame.error({ error }));
      }
    });

  }

  <template>
    {{yield
      (hash
        component=this.component
      )
    }}
  </template>
}

