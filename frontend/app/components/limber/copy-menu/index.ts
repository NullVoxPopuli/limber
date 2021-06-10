import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

/**
 * This component is injected via the markdown rendering
 */
class CopyMenu extends Component {
  @action
  copyAsText(event: Event) {
    let target = event.target as HTMLElement;

    let code = target.closest('.glimdown-render').querySelector('pre');

    if (!code) return;

    navigator.clipboard.writeText(code.innerText);
  }

  @action
  copyAsImage() {
    /* ... */
  }
}

export default setComponentTemplate(
  hbs`
    <PopperJS as |trigger popover isShown|>
      <button
        {{trigger}}
        type='button'
        title='copy to clipboard'
        class='
          absolute top-3 right-4 px-2 py-1
          rounded-sm
          bg-white text-black text-sm
          focus:ring-4 focus-visible:outline-none ring-ember-brand focus:outline-none
        '
      >
        📋
      </button>

      <div
        class="
          grid gap-2 {{unless isShown "hidden"}}
          px-2 py-2 bg-white rounded-md shadow
        " {{popover}}
      >
        <Limber::CopyMenu::Option>
          Copy as text
        </Limber::CopyMenu::Option>
        <Limber::CopyMenu::Option>
          Copy as image
        </Limber::CopyMenu::Option>
      </div>
    </PopperJS>
  `,
  CopyMenu
);
