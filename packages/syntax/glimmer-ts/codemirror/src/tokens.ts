import { ExternalTokenizer } from '@lezer/lr';

import { templateTagContent as templateTagToken } from './syntax.grammar.terms';

export function matchForComment(commentEndPattern: number[], commentToken: number, input: any) {
  for (let found = 0, i = 0; ; i++) {
    if (input.next < 0) {
      if (i) input.acceptToken(commentToken);

      break;
    }

    let hasMatch = commentEndPattern[found] === input.next;

    if (!hasMatch) {
      found = 0;
      input.advance();

      break;
    }

    if (found === commentEndPattern.length - 1) {
      if (i > commentEndPattern.length - 1) {
        input.acceptToken(commentToken, 1 - commentEndPattern.length);

        break;
      } else {
        console.warn('Reached end of comment but there is still content left');
      }

      break;
    }

    found++;
    input.advance();
  }
}

const closingTemplateTag = '</template>'.split('').map((char) => char.charCodeAt(0));

export const templateTagContent = new ExternalTokenizer((input) => {
  return matchForComment(closingTemplateTag, templateTagToken, input);
});
