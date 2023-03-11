import Component from '@glimmer/component';
import { service } from '@ember/service';
import { on } from '@ember/modifier';

import type RouterService from '@ember/routing/router-service';
import type DocsService from 'my-app/services/docs';

export class Prose extends Component {
  @service declare docs: DocsService;
  @service declare router: RouterService;

  showAnswer = () => this.router.transitionTo({ queryParams: { showAnswer: 1 }});
  hideAnswer = () => this.router.transitionTo({ queryParams: { showAnswer: 0 }});


  <template>
    prose here

    <footer>
      <button {{on "click" this.showAnswer}}>
        Show Answer
      </button>
      <button {{on "click" this.hideAnswer}}>
        Hide Answer
      </button>
    </footer>

  </template>
}
