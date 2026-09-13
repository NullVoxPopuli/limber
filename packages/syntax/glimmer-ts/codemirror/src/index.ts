import { javascriptLanguage, typescriptLanguage } from '@codemirror/lang-javascript';
import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { parseMixed } from '@lezer/common';
import { glimmer, glimmerLanguage } from 'codemirror-lang-glimmer';

import { parser as metaParser } from './syntax.grammar';

import type { Parser } from '@lezer/common';

export function gjs() {
  return new LanguageSupport(gjsLanguage, [glimmer().support]);
}

export function gts() {
  return new LanguageSupport(gtsLanguage, [glimmer().support]);
}

/**
 * The script parser sees the whole file with the template tags cut out,
 * so a template inside a class body does not break the class.
 */
function nest(scriptParser: Parser) {
  return parseMixed((node) => {
    if (node.type.name === 'GlimmerTemplateTag') {
      return { parser: glimmerLanguage.parser };
    }

    if (node.type.isTop) {
      return { parser: scriptParser, overlay: (child) => child.type.name === 'JsContent' };
    }

    return null;
  });
}

export const gtsLanguage = LRLanguage.define({
  parser: metaParser.configure({ wrap: nest(typescriptLanguage.parser) }),
});

export const gjsLanguage = LRLanguage.define({
  parser: metaParser.configure({ wrap: nest(javascriptLanguage.parser) }),
});
