import { on } from '@ember/modifier';

import { cell } from 'ember-resources';

import type { TOC } from '@ember/component/template-only';

const hideText = cell(true);
const hoverShowText = () => (hideText.current = false);
const hideShowText = () => (hideText.current = true);

import { Button } from 'limber-ui';

/**
 * TODO: how do you correctly animate the width
 *       of a button that gets text added?
 */
export const ShowMe: TOC<{ Args: { onClick: () => void } }> = <template>
  <Button
    @variant="primary"
    class="whitespace-nowrap transition-all overflow-hidden text-left"
    style="transition-duration: 50ms"
    {{on "click" @onClick}}
    {{on "mouseenter" hoverShowText}}
    {{on "mouseleave" hideShowText}}
    {{on "focusin" hoverShowText}}
    {{on "focusout" hideShowText}}
  >
    <span>
      Show me
      <span class="{{if hideText.current 'sr-only'}}">the answer</span>
    </span>
  </Button>
</template>;
