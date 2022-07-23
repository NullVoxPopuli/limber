import Component from '@glimmer/component';
import Ember from 'ember';
import { hash } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import { waitFor } from '@ember/test-waiters';

import { nameFor } from 'ember-repl';
import { iframeMessageHandler } from './iframe-message-handler';
import { isAllowedFormat, DEFAULT_FORMAT, type ToParent, type Format } from 'limber/utils/messaging';

import type { ComponentLike } from '@glint/template';
import type RouterService from '@ember/routing/router-service';

interface Signature {
  Blocks: {
    default: [{
      component: ComponentLike | undefined;
    }]
  }
}

const CACHE = new Map<string, ComponentLike>();

/**
  * The Receiving Component is Limber::FrameOutput
  */
export default class Compiler extends Component<Signature> {
  @service declare router: RouterService;

  @tracked component?: ComponentLike;
  @tracked error: string | null = null;
  @tracked errorLine: number | null = null;
  @tracked template?: unknown;

  constructor(owner: unknown, args: any) {
    super(owner, args);

    let handle = (event: MessageEvent) => {
      let text = iframeMessageHandler(this)(event);

      if (text) {
        this.makeComponent(text);
      }
    }

    let handleError = (error: any, extra: any = {}) => this.report({ ...extra, status: 'error', error: error.message || error});

    window.addEventListener('message', handle);
    window.addEventListener('error', handleError);
    Ember.onerror = (error: any) => {
      /**
        * This app now can't render again, so we need to tell the host frame to re-load the output frame
        */
      handleError(error, { unrecoverable: true });
    }

    registerDestructor(this, () => window.removeEventListener('message', handle));
    registerDestructor(this, () => window.removeEventListener('error', handleError));

    this.report({ status: 'ready' });
  }

  report = (message: ToParent) => {
    window.parent.postMessage(JSON.stringify({ ...message, from: 'limber-output' }));
  }

  get format() {
    let requested  = this.router.currentRoute.queryParams.format

    if (isAllowedFormat(requested)) {
      return requested;
    }

    return DEFAULT_FORMAT;
  }


  @action
  @waitFor
  async makeComponent(text: string) {
    await compileTopLevelComponent(text, {
      format: this.format,
      onCompileStart: () => {
        this.report({ status: 'compile-begin' });
      },
      onSuccess: (component) => {
        this.component = component;
        this.report({ status: 'success' });
      },
      onError: (error: string) => {
        this.report({ status: 'error', error });
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

async function compileTopLevelComponent(text: string, {
  format, onSuccess, onError, onCompileStart }: {
    format: Format,
    onSuccess: (component: ComponentLike) => void,
    onError: (error: string) => void,
    onCompileStart: () => void
  }) {
    let id = nameFor(text);

    let existing = CACHE.get(id);
    if (existing) {
      onSuccess(existing);

      return;
    }

    const getCompiler = (format: Format): () => unknown => {
      return {
        glimdown: () => import('./glimdown'),
        gjs: () => null,
        hbs: () => null,
      }[format]
    };


    onCompileStart();

    let compiler = await getCompiler(format)?.();

    if (!compiler) {
      onError('Could not find compiler');

      return;
    }

    if (!text) {
      onError("No Input Document yet");

      return;
    }

    let { error, rootTemplate, rootComponent } = await compiler.compile(text);

    if (error) {
      onError(error.message);
      return;
    }

    if (error && rootTemplate === undefined) {
      onError(error.message);

      return;
    }

    if (error) {
      onError(error);

      // let { line } = extractPosition(error.message);

      // this.error = error.message;
      // this.errorLine = line;

      return;
    }

    CACHE.set(id, rootComponent as ComponentLike);

    onSuccess(rootComponent);
}

function extractPosition(message: string) {
  let match = message.match(/' @ line (\d+) : column/);

  if (!match) {
    return { line: null };
  }

  let [, line] = match;

  return { line: parseInt(line, 10) };
}
