import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import { waitFor } from '@ember/test-waiters';

import { nameFor } from 'ember-repl';

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
const DEFAULT_FORMAT = 'glimdown' as const;
const ALLOWED_FORMATS = [DEFAULT_FORMAT, 'gjs', 'hbs'] as const;
const isAllowedFormat = (x?: string): x is Format => Boolean(x && (ALLOWED_FORMATS as readonly string[]).includes(x));

export default class Compiler extends Component<Signature> {
  @service declare router: RouterService;

  @tracked component?: ComponentLike;
  @tracked error: string | null = null;
  @tracked errorLine: number | null = null;
  @tracked template?: unknown;

  constructor(owner: unknown, args: any) {
    super(owner, args);

    let handle = (...args: unknown[]) => console.log('compiler received', ...args);

    window.addEventListener('message', handle);

    registerDestructor(this, () => window.removeEventListener('message', handle));
  }

  get format() {
    let requested  = this.router.currentRoute.queryParams.format

    if (isAllowedFormat(requested)) {
      return requested;
    }

    return DEFAULT_FORMAT;
  }

  getCompiler = (format: Format): () => unknown => {
    return {
      glimdown: () => import('./glimdown'),
      gjs: () => 0,
      hbs: () => 0,
    }[format]
  }


  @action
  @waitFor
  async makeComponent() {
    let id = nameFor(this.text);

    this.error = null;

    if (CACHE.has(id)) {
      this.component = CACHE.get(id);

      return;
    }

    // this.isCompiling = true;

    try {
      await this._compile(id);
    } finally {
      // this.isCompiling = false;
    }
  }

  @action
  async _compile(id: string) {
    let compiler = await this.getCompiler(this.format)?.();

    if (!compiler) {
      this.error = 'Could not find compiler';

      return;
    }

    if (!this.text) {
      this.error = "No Input Document yet";
      return;
    }

    let { error, rootTemplate, rootComponent } = await compiler.compile(this.text);

    if (error) {
      console.error(error);
    }

    if (error && rootTemplate === undefined) {
      this.error = error.message;

      return;
    }

    if (error) {
      let { line } = extractPosition(error.message);

      this.error = error.message;
      this.errorLine = line;

      return;
    }

    CACHE.set(id, rootComponent as ComponentLike);

    this.component = rootComponent as ComponentLike;
  }

  <template>
    {{yield
      (hash
        component=this.component
      )
    }}
  </template>
}

function extractPosition(message: string) {
  let match = message.match(/' @ line (\d+) : column/);

  if (!match) {
    return { line: null };
  }

  let [, line] = match;

  return { line: parseInt(line, 10) };
}
