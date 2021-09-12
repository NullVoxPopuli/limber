import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { NAMES } from 'limber/snippets';

import type EditorService from 'limber/services/editor';

export default class DemoSelect extends Component {
  @service declare editor: EditorService;

  demos = NAMES;

  isSelected = ([text]: [string]) => text === this.editor.text;

  @action
  select(event: Event) {
    assert(`Expected event.target to be a <select>`, event.target instanceof HTMLSelectElement);
    let demoName = event.target.value;

    this.editor.selectDemo(demoName);
  }
}
