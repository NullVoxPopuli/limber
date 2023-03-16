import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';
import { Button } from 'limber-ui';

export class SmallScreenToggle extends Component<{ Element: HTMLButtonElement }> {
  @tracked isViewingProse = true;

  toggle = async () => {
    let nextValue = !this.isViewingProse;
    let words = document.querySelector('section[data-words]');

    if (words) {
      if (nextValue) {
        // Viewing Prose
        words.classList.remove('-translate-x-full');
      } else {
        // Not Viewing Prose
        words.classList.add('-translate-x-full');
      }
    }

    this.isViewingProse = nextValue;;
  }

  <template>
    <Button {{on 'click' this.toggle}} class="drop-shadow-md" ...attributes>
      {{#if this.isViewingProse}}
        <FaIcon @icon="angles-left" />
      {{else}}
        <FaIcon @icon="angles-right" />
      {{/if}}

    </Button>
  </template>;
}


