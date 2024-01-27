import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import { Button } from 'limber-ui';

import type DocsService from 'tutorial/services/docs';

/**
 * TODO: how do you correctly animate the width
 *       of a button that gets text added?
 */
export class ShowMe extends Component {
  <template>
    <Button
      @variant="primary"
      class="whitespace-nowrap transition-all overflow-hidden text-left"
      style="transition-duration: 50ms"
      {{on "click" this.docs.showMe}}
      {{on "mouseenter" this.hoverShowText}}
      {{on "mouseleave" this.hideShowText}}
      {{on "focusin" this.hoverShowText}}
      {{on "focusout" this.hideShowText}}
    >
      <span>
        Show me
        <span class="{{if this.hideText 'sr-only'}}">the answer</span>
      </span>
    </Button>
  </template>

  @service declare docs: DocsService;

  @tracked hideText = true;
  hoverShowText = () => (this.hideText = false);
  hideShowText = () => (this.hideText = true);
}
