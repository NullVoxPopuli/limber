import service from 'limber/helpers/service';
import highlighted from 'limber/modifiers/highlighted';
import type { TemplateOnlyComponent as TOC } from '@ember/component/template-only';

export const Placeholder: TOC<{
  Element: HTMLTextAreaElement;
}> = <template>
  {{#let (service 'editor') as |context|}}
    <label class="sr-only" for="initial-editor">
      Glimmer + Markdown Code Editor
    </label>

    <pre
      data-test-placeholder
      id="initial-editor"
      spellcheck="false"
      class="w-full h-full px-6 py-2 font-sm font-mono text-white"
      {{highlighted context.text}}
      ...attributes
    ><code class="javascript hljs gjs">{{context.text}}</code></pre>
  {{/let}}
</template>

