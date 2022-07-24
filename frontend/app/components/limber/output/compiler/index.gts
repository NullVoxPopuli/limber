import Component from '@glimmer/component';
import Ember from 'ember';
import { hash } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import { waitFor } from '@ember/test-waiters';

import { iframeMessageHandler } from './iframe-message-handler';
import { isAllowedFormat, DEFAULT_FORMAT, type ToParent } from 'limber/utils/messaging';

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

const report = (message: ToParent) => {
    window.parent.postMessage(JSON.stringify({ ...message, from: 'limber-output' }));
  }

const handleError = (error: any, extra: any = {}) => report({ ...extra, status: 'error', error: error.message || error});

function setupEvents(context: Compiler, { onReceiveText }: { onReceiveText: (text: string) => void }) {
  let handle = (event: MessageEvent) => {
    let text = iframeMessageHandler(context)(event);

    if (text) {
      onReceiveText(text);
    }
  }

  window.addEventListener('message', handle);
  window.addEventListener('error', handleError);

  Ember.onerror = (error: any) => {
    /**
      * This app now can't render again, so we need to tell the host frame to re-load the output frame
      */
    handleError(error, { unrecoverable: true });
  }

  registerDestructor(context, () => window.removeEventListener('message', handle));
  registerDestructor(context, () => window.removeEventListener('error', handleError));

  report({ status: 'ready' });
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

  constructor(owner: unknown, args: any) {
    super(owner, args);

    setupEvents(this, {
      onReceiveText: (text: string) => this.makeComponent(text)
    });
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
    console.debug(`Making top-level component with format: ${this.format}`);

    await compileTopLevelComponent(text, {
      format: this.format,
      onCompileStart: () => {
        report({ status: 'compile-begin' });
      },
      onSuccess: (component) => {
        if (!component) {
          report({ status: 'error', error: 'could not build component' });
          return;
        }

        this.component = component;
        report({ status: 'success' });
      },
      onError: (error: string) => {
        report({ status: 'error', error });
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

