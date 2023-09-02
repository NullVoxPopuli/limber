import Component from '@glimmer/component';
import { on } from '@ember/modifier';

import { getSnippetElement, toClipboard, withExtraStyles } from './copy-utils';
import Menu from './menu';

/**
 * This component is injected via the markdown rendering
 */
export default class CopyMenu extends Component {
  copyAsText = (event: Event) => {
    let code = getSnippetElement(event);

    navigator.clipboard.writeText(code.innerText);
  };

  copyAsImage = async (event: Event) => {
    let code = getSnippetElement(event);

    await withExtraStyles(code, () => toClipboard(code));
  };

  <template>
    <Menu data-test-copy-menu>
      <:trigger as |t|>
        <t.Default class="absolute top-3 right-4 z-10" data-test-copy-menu>
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
