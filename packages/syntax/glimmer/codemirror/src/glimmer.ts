import { CompletionContext } from '@codemirror/autocomplete';
import { css } from '@codemirror/lang-css';
import { html, htmlCompletionSource } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { LanguageSupport, LRLanguage, syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { parser as glimmerExpressionParser } from '@glimdown/lezer-glimmer-expression';

import { autoCloseTags } from './auto-close';
import { glimmerLanguage } from './language';
import { snippets } from './snippets';

import type { Completion } from '@codemirror/autocomplete';
import type { SyntaxNode } from '@lezer/common';

export function glimmer() {
  return new LanguageSupport(glimmerLanguage, [
    javascript().support,
    css().support,
    new LanguageSupport(
      LRLanguage.define({
        name: 'glimmer-expression',
        parser: glimmerExpressionParser.configure({}),
      }),
      []
    ),
    glimmerLanguage.data.of({ autocomplete: snippets }),
    // We may want to swap this with Glimmer-specific tag completion
    glimmerLanguage.data.of({ autocomplete: htmlTagCompletion }),
    autoCloseTags,
  ]);
}

function htmlTagCompletion(context: CompletionContext) {
  let { state, pos } = context,
    m = /<[:\-.\w\u00b7-\uffff]*$/.exec(state.sliceDoc(pos - 25, pos));

  if (!m) return null;

  let tree: SyntaxNode | null = syntaxTree(state).resolveInner(pos, -1);

  while (tree && !tree.type.isTop) {
    if (
      tree.name == 'CodeBlock' ||
      tree.name == 'FencedCode' ||
      tree.name == 'ProcessingInstructionBlock' ||
      tree.name == 'CommentBlock' ||
      tree.name == 'Link' ||
      tree.name == 'Image'
    ) {
      return null;
    }

    tree = tree.parent;
  }

  return {
    from: pos - m[0].length,
    to: pos,
    options: htmlTagCompletions(),
    validFor: /^<[:\-.\w\u00b7-\uffff]*$/,
  };
}

let _tagCompletions: readonly Completion[] | null = null;
const htmlNoMatch = html({ matchClosingTags: false });

function htmlTagCompletions() {
  if (_tagCompletions) return _tagCompletions;

  let result = htmlCompletionSource(
    new CompletionContext(EditorState.create({ extensions: htmlNoMatch }), 0, true)
  );

  return (_tagCompletions = result ? result.options : []);
}
