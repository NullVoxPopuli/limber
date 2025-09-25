import { service } from 'ember-primitives/helpers/service';
import { notInIframe } from 'ember-primitives/iframe';
import { qp } from 'ember-primitives/qp';

import highlighted from 'limber/modifiers/highlighted';

import type { TOC } from '@ember/component/template-only';

const orGlimdown = (format: string | undefined) => format || 'glimdown';

const not = (x: unknown) => !x;
const wantsOnClick = (x: unknown) => x === 'onclick';

export const Placeholder: TOC<{
  Element: HTMLPreElement;
}> = <template>
  {{#let (service "editor") as |context|}}
    {{#if (wantsOnClick (qp "editorLoad"))}}
      <button class="limber__editor__click-to-edit">
        <span>Click to Edit</span>
      </button>
    {{/if}}
    <div
      data-test-placeholder
      id="initial-editor"
      spellcheck="false"
      class="limber__editor-placeholder font-sm h-full w-full
        {{if (notInIframe) 'px-6' 'px-2'}}
        py-2 font-mono text-white"
      data-format={{orGlimdown (qp "format")}}
      {{! @glint-ignore }}
      {{(if (not (qp "nohighlight")) (modifier highlighted context.text))}}
      ...attributes
    ><pre>{{context.text}}</pre></div>
  {{/let}}
</template>;
