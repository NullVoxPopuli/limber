import Component from '@glimmer/component';
import { hash } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import { waitFor } from '@ember/test-waiters';

import { nameFor } from 'ember-repl';
import { iframeMessageHandler, isAllowedFormat, DEFAULT_FORMAT } from './iframe-message-handler';

import type { Type as Format } from './iframe-message-handler';
import type { ComponentLike } from '@glint/template';
import type RouterService from '@ember/routing/router-service';

interface Signature {
  Blocks: {
    default: [{
      component: ComponentLike | undefined;
    }]
  }
}

type Format = 'glimdown' | 'gjs' | 'hbs';

const CACHE = new Map<string, ComponentLike>();
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

    window.addEventListener('message', handle);

    registerDestructor(this, () => window.removeEventListener('message', handle));
  }

  report = (message: object) => {
    window.parent.postMessage(JSON.stringify({ message, from: 'limber-frame' } as const));
  }

  reportError = (error: string | { error: string; line: number }) => {
    this.report({ error });
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
      onSuccess: (component) => this.component = component,
      onError: this.reportError,
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

async function compileTopLevelComponent(text: string, { format, onSuccess, onError }: {format: Format, onSuccess: (component: ComponentLike) => void, onError: (error: string) => void}) {
    let id = nameFor(text);

    let existing = CACHE.get(id);
    if (existing) {
      onSuccess(existing);

      return;
    }

    const getCompiler = (format: Format): () => unknown => {
    return {
      glimdown: () => import('./glimdown'),
      gjs: () => 0,
      hbs: () => 0,
    }[format]
  }


    // this.isCompiling = true;

    try {
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
        console.error(error);
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
    } finally {
      // this.isCompiling = false;
    }
}

function extractPosition(message: string) {
  let match = message.match(/' @ line (\d+) : column/);

  if (!match) {
    return { line: null };
  }

  let [, line] = match;

  return { line: parseInt(line, 10) };
}
