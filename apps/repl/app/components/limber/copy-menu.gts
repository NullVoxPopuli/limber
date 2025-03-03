import Component from '@glimmer/component';
import { on } from '@ember/modifier';

import { copyToClipboard, getSnippetElement } from './copy-utils';
import Menu from './menu';

/**
 * This component is injected via the markdown rendering
 */
export default class CopyMenu extends Component {
  copyAsText = (event: Event) => {
    const code = getSnippetElement(event);

    navigator.clipboard.writeText(code.innerText);
  };

  copyAsImage = async (event: Event) => {
    const code = getSnippetElement(event);

    await copyToClipboard(code);
  };

  <template>
    <Menu data-test-copy-menu>
      <:trigger as |t|>
        <t.Default class="absolute right-4 top-3 z-10" data-test-copy-menu>
          📋
        </t.Default>
      </:trigger>

      <:options as |Item|>
        <Item {{on "click" this.copyAsText}}>
          Copy as text
        </Item>
        <Item {{on "click" this.copyAsImage}}>
          Copy as image
        </Item>
      </:options>
    </Menu>
  </template>
}
