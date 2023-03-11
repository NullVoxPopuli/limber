import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { modifier } from 'ember-modifier';
import { waitForPromise, waitFor, buildWaiter } from '@ember/test-waiters';
import { connectToChild, type Connection } from 'penpal';

import { DEFAULT_SNIPPET } from 'limber/snippets';
import { fileFromParams, formatFrom, type Format, type OutputError } from 'limber/utils/messaging';

import type EditorService from 'limber/services/editor';
import type RouterService from '@ember/routing/router-service';

const compileWaiter = buildWaiter('<FrameOutput />::compile');
const compileTokens: unknown[] = [];

/**
  * The Receiving Component is Limber::Output::Compiler
  */
export default class FrameOutput extends Component {
  @service declare editor: EditorService;
  @service declare router: RouterService;

  @tracked frameStatus: unknown;

  connection?: Connection<{
    update: (format: Format, text: string) => void;
  }>;
  hadUnrecoverableError = false;

  get format() {
    let requested  = this.router.currentRoute.queryParams.format
    return formatFrom(requested);
  }


  /**
    * We can't post right away, because we might do so before the iframe is ready.
    * We need to wait until the frame initiates contact.
    */
  postMessage = modifier((element: HTMLIFrameElement, [_status]) => {
    if (!element.contentWindow) return;

    if (this.hadUnrecoverableError && this.frameStatus === 'ready') {
      this.hadUnrecoverableError = false;

      // this reloads the frame
      element.src = `/output?format=${this.format}`;

      return;
    }

    this.queuePayload();
  });

  @action
  @waitFor
  async queuePayload() {
    let qps = this.router.currentURL.split('?')[1];

    if (!this.connection) return;

    let child = await this.connection.promise;
    if (isDestroyed(this) || isDestroying(this)) return;

    let { text, format } = fileFromParams(qps);

    compileTokens.push(compileWaiter.beginAsync());
    await child.update(format, text ?? DEFAULT_SNIPPET);
  }

  onMessage = modifier((element: HTMLIFrameElement) => {
    this.connection = connectToChild({
      iframe: element,
      methods: {
        ready: () => this.frameStatus = 'ready',
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
          compileTokens.forEach(token => compileWaiter.endAsync(token));
        }

      }
    });

    waitForPromise(this.connection.promise).catch(console.error);

    return () => this.connection?.destroy();
  });

  <template>
    <iframe
      {{this.postMessage this.frameStatus}}
      {{this.onMessage}}
      title='Rendered output'
      class='w-full h-full border-none'
      src='/output?format={{this.format}}'
    ></iframe>
  </template>
}
