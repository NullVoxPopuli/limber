import { service } from 'ember-primitives/helpers/service';
import { castToBoolean, qp } from 'ember-primitives/qp';

import { highlighted } from '@nullvoxpopuli/limber-shared/highlighting';

import type { TOC } from '@ember/component/template-only';

const orGlimdown = (format: string | undefined) => format || 'glimdown';

const wantsOnClick = (x: unknown) => x === 'onclick';

/**
 * CodeMirror sizes its line number gutter with a number of all nines
 * that has as many digits as the line count.
 */
function widestLineNumber(text: string | null | undefined) {
  const lines = (text ?? '').split('\n').length;

  return '9'.repeat(String(lines).length);
}

/**
 * The fold gutter of CodeMirror is as wide as its widest marker.
 * "⌄" marks a foldable line, and is wider than the "›" that CodeMirror uses when nothing folds.
 * Indented lines and markdown headings are what fold in practice.
 */
function foldMarker(text: string | null | undefined) {
  return /^(#{1,6} |[ \t]+\S)/m.test(text ?? '') ? '⌄' : '›';
}

function wantsHighlighting(qpNoHighlight: string | undefined) {
  if (qpNoHighlight) {
    return !castToBoolean(qpNoHighlight);
  }

  return true;
}

export const Placeholder: TOC<{
  Element: HTMLDivElement;
}> = <template>
  {{#let (service "editor") as |context|}}
    {{#if (wantsOnClick (qp "editorLoad"))}}
      <button class="limber__editor__click-to-edit" type="button">
        <span>Click to Edit</span>
      </button>
    {{/if}}
    <div class="limber__editor-placeholder text-white" ...attributes>
      {{! Takes the space of the line number and fold gutters of CodeMirror. }}
      <div class="limber__editor-placeholder__gutter" aria-hidden="true">
        <span>{{widestLineNumber context.text}}</span>
        <span>{{foldMarker context.text}}</span>
      </div>
      <div
        data-test-placeholder
        id="initial-editor"
        spellcheck="false"
        class="limber__editor-placeholder__code"
        data-format={{orGlimdown (qp "format")}}
        {{! @glint-ignore }}
        {{(if (wantsHighlighting (qp "nohighlight")) (modifier highlighted context.text))}}
      ><pre>{{context.text}}</pre></div>
    </div>
  {{/let}}
</template>;
