import Component from '@glimmer/component';
import Ember from 'ember';
// @ts-ignore
import { hash } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { registerDestructor, isDestroyed, isDestroying } from '@ember/destroyable';
import { connectToParent, type Connection, type AsyncMethodReturns } from 'penpal';

import { formatFrom, type OutputError, type Format } from 'limber/utils/messaging';

import type { ComponentLike } from '@glint/template';
import type RouterService from '@ember/routing/router-service';

export interface MessagingAPI {
  onReceiveText: (callback: (text: string) => void) => void;
  onConnect: (callback: (parent: AsyncMethodReturns<ParentMethods>) => void) => void;
}

export type Parent = AsyncMethodReturns<ParentMethods>;

interface Signature {
  Blocks: {
    default: [MessagingAPI]
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
      update(_format: Format, text: string) {
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
  Ember.onerror = (error: any) => parent.error({ error: error.message || error, unrecoverable: true });

  const handleError = (error: any) => parent.error({ error: error.message || error });

  window.addEventListener('error', handleError);

  registerDestructor(context, () => window.removeEventListener('error', handleError));

  await parent.ready();

  return connection;
}


/**
  * The Receiving Component is Limber::FrameOutput
  *
  * The purpose of this class is not *not* use it during testing so we can test the compiler
  * end renderer more directly.
  *
  * Also because testem can't handle iframes, we need to jump through a couple extra hoops.
  *
  * But this leads to smaller, more focused components, so... maybe that's good. idk.
  *
  *
  */
export default class Compiler extends Component<Signature> {
  @service declare router: RouterService;

  @tracked component?: ComponentLike;
  @tracked error: string | null = null;
  @tracked errorLine: number | null = null;
  @tracked template?: unknown;

  connection?: Connection<ParentMethods>;

  get format() {
    let requested = this.router.currentRoute.queryParams.format

    return formatFrom(requested);
  }

  _onReceiveText?: (text: string) => void;
  onReceiveText = (callback: NonNullable<typeof this._onReceiveText>) => {
    this._onReceiveText = callback;
    this.trySetup()
  };

  _onConnect?: (parent: AsyncMethodReturns<ParentMethods>) => void;
  onConnect = (callback: NonNullable<typeof this._onConnect>) => {
    this._onConnect = callback;
    this.trySetup();
  };

  trySetup = () => {
    let { _onReceiveText, _onConnect, connection } = this;

    if (_onReceiveText && _onConnect && !connection) {
      setupEvents(this, {
        onReceiveText: _onReceiveText,
        onConnect: _onConnect,
      })
    }
  };

  <template>{{yield (hash onReceiveText=this.onReceiveText onConnect=this.onConnect)}}</template>
}

