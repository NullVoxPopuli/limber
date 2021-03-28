import Component from '@glimmer/component';
import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { ALL } from 'limber/starting-snippet';

import type EditorService from 'limber/services/editor';

export default class DemoSelect extends Component {
  @service declare editor: EditorService;

  demos = ALL;

  isSelected = helper(([text]: [string]) => text === this.editor.text);

  @action
  select(event: Event) {
    assert('Event must have a target', event.target instanceof HTMLSelectElement);
    let text = event.target.value;

    this.editor.updateDemo(text);
  }
}
