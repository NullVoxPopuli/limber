import { assert } from '@ember/debug';

import type { TOC } from '@ember/component/template-only';

function querySelector(selector: string) {
  const result = document.querySelector(selector);

  assert(`Could not find element matching ${selector}`, result);

  return result;
}

export const GlobalHint: TOC<{ Blocks: { default: [] } }> = <template>
  {{#in-element (querySelector "#limber-portal-target-global-hint")}}
    <footer class="global-hint">{{yield}}</footer>
  {{/in-element}}
</template>;
