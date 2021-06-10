import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

class CopyMenu extends Component {
  @action
  copyAsText() {
    /* ... */
  }

  @action
  copyAsImage() {
    /* ... */
  }
}

export default setComponentTemplate(
  hbs`
    <PopperJS as |trigger popover|>
      <button
        {{trigger}}
        type='button'
        title='copy to clipboard'
      >
        📋
      </button>

      <ul {{popover}}>
        <li>
          <button>Copy as text</button>
        </li>
        <li>
          <button>Copy as image</button>
        </li>
      </ul>
    </PopperJS>
  `,
  CopyMenu
);
