import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { waitFor } from '@ember/test-waiters';

import { getFromLabel, NAMES } from 'limber/snippets';

import type EditorService from 'limber/services/editor';

export default class DemoSelect extends Component {
  @service declare editor: EditorService;

  demos = NAMES;

  @action
  @waitFor
  async select(demoName: string) {
    let demo = await getFromLabel(demoName);

    this.editor.updateDemo(demo);
  }
}
