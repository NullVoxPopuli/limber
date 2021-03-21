import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { setComponentTemplate } from '@ember/component';
import templateOnlyComponent from '@ember/component/template-only';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { debounce, schedule } from '@ember/runloop';
import Service from '@ember/service';

import { compileTemplate } from './compile-template';
import { compileMarkdown } from './markdown-to-ember';
import { DEFAULT_SNIPPET } from './starting-snippet';

export default class EditorService extends Service {
  @tracked component = null;
  @tracked error = null;
  @tracked text = DEFAULT_SNIPPET;
  @tracked markdownToHbs = null;
  @tracked template = null;

  constructor() {
    super(...arguments);

    schedule('afterRender', () => this.makeComponent());
  }

  @action
  async makeComponent() {
    let id = `runtime-${guidFor(this.text)}`;
    let owner = getOwner(this);
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

      owner.register(`component:${id}`, setComponentTemplate(template, templateOnlyComponent()));
    } catch (e) {
      this.error = `Use the 'Ember' tab to debug\n\n` + e.message;
      return;
    }

    let previousId = this.component;
    this.component = id;
    this.template = template(owner).parsedLayout.block;

    owner.unregister(`component:${previousId}`);
  }

  @action
  updateText(e) {
    this.text = e.target.value;

    debounce(this, this.makeComponent, 300);
  }
}
