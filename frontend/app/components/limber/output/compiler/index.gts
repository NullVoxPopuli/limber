import Component from '@glimmer/component';
import { schedule } from '@ember/runloop';
import { hash } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { waitFor, waitForPromise } from '@ember/test-waiters';

import { formatFrom } from 'limber/utils/messaging';

import { compileTopLevelComponent } from './create-top-level-component'

import type { ComponentLike } from '@glint/template';
import type RouterService from '@ember/routing/router-service';
import type { MessagingAPI, Parent } from '../frame-messaging';

interface Signature {
  Args: {
    messagingAPI: MessagingAPI
  }
  Blocks: {
    default: [{
      component: ComponentLike | undefined;
    }]
  }
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

  declare parentFrame: Parent;

  constructor(owner: unknown, args: Signature['Args']) {
    super(owner, args);

    let api = args.messagingAPI;

    api.onReceiveText((text) => this.makeComponent(text));
    api.onConnect((parent) => this.parentFrame = parent);
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

