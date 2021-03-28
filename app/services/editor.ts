import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { debounce, schedule } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';

import { DEFAULT_SNIPPET } from 'limber/starting-snippet';

import { compile, doesExist, opcodesFrom, register } from './-compile';
import { compileTemplate } from './-compile/ember-to-opcodes';

import type ApplicationInstance from '@ember/application/instance';
import type RouterService from '@ember/routing/router-service';

export default class EditorService extends Service {
  @service declare router: RouterService;

  @tracked component?: string;
  @tracked error: string | null = null;
  @tracked errorLine: number | null = null;
  @tracked markdownToHbs?: string;
  @tracked template?: unknown;

  declare _editorSwapText: (text: string) => void;

  text = getQP() ?? DEFAULT_SNIPPET;

  constructor(...args: Injections) {
    super(...args);

    schedule('afterRender', () => this.makeComponent());
  }

  @action
  async makeComponent() {
    let owner = getOwner(this);
    let id = `runtime-${guidFor(this.text)}`;

    if (doesExist(owner, id, this.component)) {
      return;
    }

    this.error = null;

    let compilationResult = await compile(this.text, id);
    let { error, rootTemplate, rootTemplateFactory } = compilationResult;

    if (error) {
      console.error(error);
    }

    if (error && rootTemplate === undefined) {
      this.error = error.message;

      return;
    }

    if (error && !rootTemplateFactory) {
      let { line } = extractPosition(error.message);

      this.router.transitionTo('ember');
      this.error = error.message;
      this.errorLine = line;

      return;
    }

    if (error) {
      console.error('Unhandled error');

      return;
    }

    if (rootTemplate !== undefined) {
      this.markdownToHbs = rootTemplate;
    }

    if (rootTemplateFactory) {
      register(owner, rootTemplateFactory);
    }

    assert(`Expected to have a template factory`, rootTemplateFactory);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (compilationResult as any).liveCode.map(({ name }: any) => registerPlaceholder(owner, name));

    let previousId = this.component;

    this.component = id;
    this.template = opcodesFrom(owner, rootTemplateFactory);

    owner.unregister(`component:${previousId}`);
  }

  @action
  updateText(text: string) {
    this.text = text;
    debounce(this, this._updateSnippet, 300);
  }

  @action
  updateDemo(text: string) {
    this._editorSwapText(text);
  }

  @action
  swapText(callback: (text: string) => void) {
    this._editorSwapText = callback;
  }

  @action
  _updateSnippet() {
    let qps = buildQP(this.text);
    let base = this.router.currentURL.split('?')[0];
    let next = `${base}?${qps}`;

    this.makeComponent();

    this.router.replaceWith(next);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    editor: EditorService;
  }
}

function registerPlaceholder(owner: ApplicationInstance, name: string) {
  let template = compileTemplate('WIP Placeholder Content', { moduleName: name });

  register(owner, template);
}

/**
 * https://stackoverflow.com/a/57533980/356849
 * - Base64 Encoding is 33% bigger
 *
 * https://github.com/rotemdan/lzutf8.js
 * - Compression
 */
function buildQP(rawText: string) {
  const params = new URLSearchParams(location.search);

  params.set('t', rawText);

  return params;
}

function getQP() {
  let qpT = new URLSearchParams(location.search).get('t');

  return qpT;
}

function extractPosition(message: string) {
  let match = message.match(/' @ line (\d+) : column/);

  if (!match) {
    return { line: null };
  }

  let [, line] = match;

  return { line: parseInt(line, 10) };
}
