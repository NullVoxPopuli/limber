import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import { Button } from '@nullvoxpopuli/limber-shared';

import type DocsService from 'tutorial/services/docs';

/**
 * TODO: how do you correctly animate the width
 *       of a button that gets text added?
 */
export class UnShowMe extends Component {
  <template>
    <Button
      @variant="secondary"
      class="overflow-hidden whitespace-nowrap text-left transition-all"
      style="transition-duration: 50ms"
      {{on "click" this.docs.unShowMe}}
    >
      <span>
        Hide Answer
      </span>
    </Button>
  </template>

  @service declare docs: DocsService;
}
