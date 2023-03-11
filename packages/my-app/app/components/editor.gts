import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { service } from '@ember/service';
import { REPL } from 'limber-snippet';

import DocsService from 'my-app/services/docs';

const promptPath = (path: string): `${string}.gjs` => `docs/${path}/prompt.gjs`;
const answerPath = (path: string): `${string}.gjs` => `docs/${path}/answer.gjs`;

export class Editor extends Component {
  @service declare docs: DocsService;

  // TODO: answer may not exist
  get activePath() {
    assert(`Cannot call activePath unless there is a path to resolve`, this.docs.selected);

    if (this.docs.showAnswer) {
      return answerPath(this.docs.selected.path);
    }

    return promptPath(this.docs.selected.path);
  }

  <template>
    {{#if this.docs.selected}}
      <REPL @path={{this.activePath}} />
    {{/if}}
  </template>
}
