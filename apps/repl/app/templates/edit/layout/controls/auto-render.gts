import Component from '@glimmer/component';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faForwardStep, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';

import { Button } from './button.gts';

import type RouterService from '@ember/routing/router-service';
import type EditorService from 'limber/services/editor';

export class AutoRender extends Component {
  @service declare editor: EditorService;
  @service declare router: RouterService;

  toggle = () => {
    const url = new URL(this.router.currentURL ?? '/edit', location.origin);

    if (this.editor.autoRender) {
      url.searchParams.set('autorender', 'off');
    } else {
      url.searchParams.delete('autorender');
    }

    this.router.replaceWith(url.pathname + url.search);
  };

  <template>
    <Button
      title={{if this.editor.autoRender "Pause automatic rendering" "Resume automatic rendering"}}
      data-test-auto-render
      {{on "click" this.toggle}}
    >
      {{#if this.editor.autoRender}}
        <FaIcon @icon={{faPause}} />
      {{else}}
        <FaIcon @icon={{faPlay}} />
      {{/if}}
    </Button>
    {{#unless this.editor.autoRender}}
      <Button title="Render" data-test-render {{on "click" this.editor.render}}>
        <FaIcon @icon={{faForwardStep}} />
      </Button>
    {{/unless}}
  </template>
}
