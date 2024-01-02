import Ember from 'ember';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying, registerDestructor } from '@ember/destroyable';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { hash } from '@ember/helper';
import { service } from '@ember/service';

import { type AsyncMethodReturns, type Connection, connectToParent } from 'penpal';

import { type Format, type OutputError } from 'limber/utils/messaging';

import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';

export interface MessagingAPI {
  onReceiveText: (callback: (format: Format, text: string) => void) => void;
  onConnect: (callback: (parent: AsyncMethodReturns<ParentMethods>) => void) => void;
}

export type Parent = AsyncMethodReturns<ParentMethods>;

interface Signature {
  Blocks: {
    default: [MessagingAPI];
  };
}

interface ParentMethods {
  ready: () => void;
  error: (error: OutputError) => void;
  beginCompile: () => void;
  success: () => void;
  finishedRendering: () => void;
}

async function setupEvents(
  context: Compiler,
  {
    onReceiveText,
    onConnect,
  }: {
    onReceiveText: (format: Format, text: string) => void;
    onConnect: (parent: AsyncMethodReturns<ParentMethods>) => void;
  }
) {
  let connection = connectToParent<ParentMethods>({
    methods: {
      update(format: Format, text: string) {
        onReceiveText(format, text);
      },
    },
  });

  context.connection = connection;

  registerDestructor(context, () => connection.destroy());

  let parent = await connection.promise;

  onConnect(parent);

  if (isDestroyed(context) || isDestroying(context)) return;

  /**
   * This app now can't render again, so we need to tell the host frame to re-load the output frame
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Ember.onerror = (error: any) =>
    parent.error({ error: error.message || error, unrecoverable: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleError = (error: any) => parent.error({ error: error.message || error });

  window.addEventListener('error', handleError);

  registerDestructor(context, () => window.removeEventListener('error', handleError));

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

  _onReceiveText?: (format: Format, text: string) => void;
  onReceiveText = (callback: NonNullable<typeof this._onReceiveText>) => {
    this._onReceiveText = callback;
    this.trySetup();
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
      });
    }
  };

  <template>{{yield (hash onReceiveText=this.onReceiveText onConnect=this.onConnect)}}</template>
}
