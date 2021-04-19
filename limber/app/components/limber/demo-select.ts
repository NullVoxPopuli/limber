import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { ALL } from 'limber/starting-snippet';

import type EditorService from 'limber/services/editor';

export default class DemoSelect extends Component {
  @service declare editor: EditorService;

  demos = ALL;

  isSelected = ([text]: [string]) => text === this.editor.text;

  @action
  select(demo: typeof ALL[0]) {
    this.editor.updateDemo(demo.snippet);
  }
}
