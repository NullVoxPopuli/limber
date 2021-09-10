import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { waitFor } from '@ember/test-waiters';

import { getFromLabel, NAMES } from 'limber/snippets';

import type EditorService from 'limber/services/editor';

export default class DemoSelect extends Component {
  @service declare editor: EditorService;

  demos = NAMES;

  isSelected = ([text]: [string]) => text === this.editor.text;

  @action
  @waitFor
  async select(event: Event) {
    assert(`Expected event.target to be a <select>`, event.target instanceof HTMLSelectElement);
    let demoName = event.target.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let demo = await getFromLabel(demoName as any);

    this.editor.updateDemo(demo);
  }
}
