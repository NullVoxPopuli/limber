import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { setComponentTemplate } from '@ember/component';
import templateOnlyComponent from '@ember/component/template-only';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { debounce, schedule } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';

import { compileTemplate } from './compile-template';
import { compileMarkdown } from './markdown-to-ember';
import { DEFAULT_SNIPPET } from './starting-snippet';

export default class EditorService extends Service {
  @service router;

  @tracked component = null;
  @tracked error = null;
  @tracked errorLine = 20;
  @tracked markdownToHbs = null;
  @tracked template = null;
  @tracked text = getQP() ?? DEFAULT_SNIPPET;

  constructor() {
    super(...arguments);

    schedule('afterRender', () => this.makeComponent());
  }

  @action
  async makeComponent() {
    let owner = getOwner(this);
    let id = `runtime-${guidFor(this.text)}`;

    if (id === this.component && owner.hasRegistration(`component:${id}`)) {
      // already registered
      return;
    }

    this.error = null;
    let readyForCompile;
    let template;

    try {
      readyForCompile = compileMarkdown(this.text);
      this.markdownToHbs = readyForCompile;
    } catch (e) {
      this.error = e.message;
      return;
    }

    try {
      template = compileTemplate(readyForCompile, { moduleName: id });

      console.log(`Registering: `, id);
      owner.register(`component:${id}`, setComponentTemplate(template, templateOnlyComponent()));
    } catch (e) {
      if (e.message.includes('Cannot re-register')) {
        return;
      }

      this.router.transitionTo('/ember');
      this.error = e.message;

      let { line } = extractPosition(this.error);
      this.errorLine = line;

      return;
    }

    let previousId = this.component;
    this.component = id;
    this.template = template(owner).parsedLayout.block;

    console.log('UnRegistering: ', previousId);
    owner.unregister(`component:${previousId}`);
  }

  @action
  updateText(e) {
    this.text = e.target.value;

    debounce(this, this._updateSnippet, 300);
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
/**
 * https://stackoverflow.com/a/57533980/356849
 * - Base64 Encoding is 33% bigger
 *
 * https://github.com/rotemdan/lzutf8.js
 * - Compression
 */
function buildQP(rawText) {
  const params = new URLSearchParams(location.search);
  params.set('t', rawText);

  return params;
}

function getQP() {
  let qpT = new URLSearchParams(location.search).get('t');

  return qpT;
}

function extractPosition(message) {
  try {
    let [, line] = message.match(/' @ line (\d+) : column/);
    return { line };
  } catch (e) {
    console.error({ e, message });
  }

  return { line: null };
}
