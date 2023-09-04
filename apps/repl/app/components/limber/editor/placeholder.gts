import { CodeBlock } from 'ember-shiki';

import qp from 'limber/helpers/qp';
import { service } from 'limber-ui';

import type { TOC } from '@ember/component/template-only';

const orMarkdown = (format: string | undefined) => (format === 'glimdown' ? 'markdown' : format);
// const orGlimdown = (format: string | undefined) => format || 'glimdown';
const orEmpty = (code: string | null) => code ?? '';

export const Placeholder: TOC<{
  Element: HTMLDivElement;
}> = <template>
  {{#let (service "editor") as |context|}}
    <label class="sr-only" for="initial-editor">
      Glimmer + Markdown Code Editor
    </label>

    <CodeBlock
      data-test-placeholder
      id="initial-editor"
      spellcheck="false"
      class="w-full h-full px-6 py-2 font-sm font-mono text-white"
      ...attributes
      @code={{orEmpty context.text}}
      @language={{orMarkdown (qp "format")}}
    />
  {{/let}}
</template>;
