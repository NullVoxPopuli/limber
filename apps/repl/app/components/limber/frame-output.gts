import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying, registerDestructor } from '@ember/destroyable';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { buildWaiter, waitFor, waitForPromise } from '@ember/test-waiters';

import { modifier } from 'ember-modifier';
import { type Connection, connectToChild } from 'penpal';

import { fileFromParams, type Format, type OutputError } from 'limber/utils/messaging';

import type Owner from '@ember/owner';
import type RouterService from '@ember/routing/router-service';
import type EditorService from 'limber/services/editor';

const compileWaiter = buildWaiter('<FrameOutput />::compile');
const compileTokens: unknown[] = [];

type FrameStatus = 'disconnected' | 'connected';

/**
 * The Receiving Component is Limber::Output::Compiler
 */
export default class FrameOutput extends Component {
  @service declare editor: EditorService;
  @service declare router: RouterService;

  @tracked frameStatus: FrameStatus = 'disconnected';
  @tracked hadUnrecoverableError = false;

  connection?: Connection<{
    update: (format: Format, text: string) => void;
  }>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(owner: Owner, args: any) {
    super(owner, args);

    registerDestructor(this, () => {
      this.connection?.destroy();
    });
  }

  @action
  @waitFor
  async queuePayload() {
    let qps = this.router.currentURL?.split('?')[1];

    if (!this.connection) return;

    let child = await this.connection.promise;

    if (isDestroyed(this) || isDestroying(this)) return;

    if (this.frameStatus === 'disconnected') {
      console.warn('Frame is disconnected, not sending payload');

      return;
    }

    let { text, format } = fileFromParams(qps);

    if (text && format) {
      await child.update(format, text);
    }

    compileTokens.push(compileWaiter.beginAsync());
  }

  /**
   * HMM.... statechart
   */
  previous = '';
  previousURL = '';
  monitorConnection = modifier((element: HTMLIFrameElement) => {
    let status = this.frameStatus;
    let currentURL = this.router.currentURL;

    if (!currentURL) return;

    if (status === 'connected' && currentURL !== this.previousURL) {
      this.previous = status;
      this.previousURL = currentURL;

      return this.postMessage(element);
    }

    if (status !== this.previous) {
      this.previous = status;
      this.previousURL = currentURL;

      switch (status) {
        case 'disconnected': {
          this.connectToOutput(element);

          break;
        }
        case 'connected': {
          this.postMessage(element);
        }
      }
    }
  });

  /**
   * We have to reload the output frame
   */
  setNoError = async (element: HTMLIFrameElement) => {
    this.connection?.destroy();
    element.src = `/output`;
    await Promise.resolve();
    this.frameStatus = 'disconnected';
    this.hadUnrecoverableError = false;
  };

  /**
   * We can't post right away, because we might do so before the iframe is ready.
   * We need to wait until the frame initiates contact.
   */
  postMessage = (element: HTMLIFrameElement) => {
    if (this.hadUnrecoverableError) {
      this.setNoError(element);

      return;
    }

    this.queuePayload();
  };

  connectToOutput = (element: HTMLIFrameElement) => {
    this.connection = connectToChild({
      iframe: element,
      methods: {
        error: (obj: OutputError) => {
          this.editor.error = obj.error;
          this.editor.isCompiling = false;

          if ('unrecoverable' in obj) {
            this.hadUnrecoverableError = true;
          }
        },
        beginCompile: () => {
          compileTokens.push(compileWaiter.beginAsync());
          this.editor.isCompiling = true;
        },
        success: () => {
          this.editor.error = undefined;
          this.editor.isCompiling = false;
        },
        finishedRendering: () => {
          compileTokens.forEach((token) => compileWaiter.endAsync(token));
        },
      },
    });

    /**
     * It's important to change the frameStatus so that
     * postMessage can run again with a connection
     */
    waitForPromise(this.connection.promise)
      .then(() => (this.frameStatus = 'connected'))
      .catch(console.error);
  };

  <template>
    <iframe
      {{this.monitorConnection}}
      title="Rendered output"
      class="w-full h-full border-none"
      src="/output"
    ></iframe>
  </template>
}
