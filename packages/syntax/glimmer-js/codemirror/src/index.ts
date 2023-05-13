import { javascriptLanguage, typescriptLanguage } from '@codemirror/lang-javascript';
import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { parseMixed } from '@lezer/common';
import { glimmer, glimmerLanguage } from 'codemirror-lang-glimmer';

import { parser as metaParser } from './syntax.grammar';

export function gjs() {
  return new LanguageSupport(gjsLanguage, [glimmer().support]);
}

export function gts() {
  return new LanguageSupport(gtsLanguage, [glimmer().support]);
}

export const gtsLanguage = LRLanguage.define({
  parser: metaParser.configure({
    wrap: parseMixed((node) => {
      if (node.type.name === 'Document') return null;

      if (node.type.name === 'GlimmerTemplateTag') {
        return { parser: glimmerLanguage.parser };
      }

      return { parser: typescriptLanguage.parser };
    }),
  }),
});

export const gjsLanguage = LRLanguage.define({
  parser: metaParser.configure({
    wrap: parseMixed((node) => {
      if (node.type.name === 'Document') return null;

      if (node.type.name === 'GlimmerTemplateTag') {
        return { parser: glimmerLanguage.parser };
      }

      return { parser: javascriptLanguage.parser };
    }),
  }),
});
