import { service } from 'ember-primitives/helpers/service';
import { qp } from 'ember-primitives/qp';

import highlighted from 'limber/modifiers/highlighted';

import type { TOC } from '@ember/component/template-only';

const orGlimdown = (format: string | undefined) => format || 'glimdown';

const not = (x: unknown) => !x;

export const Placeholder: TOC<{
  Element: HTMLPreElement;
}> = <template>
  {{log "QP:" (qp "nohighlight")}}
  {{#let (service "editor") as |context|}}
    <div
      data-test-placeholder
      id="initial-editor"
      spellcheck="false"
      class="limber__editor-placeholder font-sm h-full w-full px-6 py-2 font-mono text-white"
      data-format={{orGlimdown (qp "format")}}
      {{! @glint-ignore }}
      {{(if (not (qp "nohighlight")) (modifier highlighted context.text))}}
      ...attributes
    ><pre>{{context.text}}</pre></div>
  {{/let}}
</template>;
