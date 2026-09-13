import { ExternalTokenizer } from '@lezer/lr';

import { JsContent, templateTagContent as templateTagToken } from './syntax.grammar.terms';

import type { InputStream } from '@lezer/lr';

const quoteDouble = 34;
const quoteSingle = 39;
const backslash = 92;
const newline = 10;
const slash = 47;
const asterisk = 42;
const tick = 96;
const lessThan = 60;

function toCodes(text: string) {
  return text.split('').map((char) => char.charCodeAt(0));
}

const openingTemplateTag = toCodes('<template>');
const closingTemplateTag = toCodes('</template>');

function matchesAt(input: InputStream, pattern: number[]) {
  for (let i = 0; i < pattern.length; i++) {
    if (input.peek(i) !== pattern[i]) return false;
  }

  return true;
}

/**
 * Accepts everything up to (not including) the end pattern as one token.
 * Nothing is accepted when the content is empty or the end pattern is missing.
 */
export function matchForComment(
  commentEndPattern: number[],
  commentToken: number,
  input: InputStream
) {
  for (let found = 0, i = 0; ; i++) {
    if (input.next < 0) {
      if (i) input.acceptToken(commentToken);

      break;
    }

    if (input.next === commentEndPattern[found]) {
      found++;

      if (found === commentEndPattern.length) {
        if (i + 1 > commentEndPattern.length) {
          input.acceptToken(commentToken, 1 - commentEndPattern.length);
        }

        break;
      }
    } else {
      found = input.next === commentEndPattern[0] ? 1 : 0;
    }

    input.advance();
  }
}

export const templateTagContent = new ExternalTokenizer((input) => {
  return matchForComment(closingTemplateTag, templateTagToken, input);
});

/**
 * Advances past a string literal that starts at the current position.
 * Returns false when the current character does not start a string.
 */
function skipString(input: InputStream) {
  const quote = input.next;

  if (quote !== quoteDouble && quote !== quoteSingle && quote !== tick) return false;

  input.advance();

  while (input.next >= 0) {
    if (input.next === backslash) {
      input.advance();
      input.advance();
      continue;
    }

    if (input.next === quote) {
      input.advance();

      return true;
    }

    if (input.next === newline && quote !== tick) return true;

    input.advance();
  }

  return true;
}

/**
 * Advances past a line or block comment that starts at the current position.
 * Returns false when the current character does not start a comment.
 */
function skipComment(input: InputStream) {
  const first: number = input.next;
  const second = input.peek(1);

  if (first !== slash) return false;

  if (second === slash) {
    while (input.next >= 0 && input.next !== newline) input.advance();

    return true;
  }

  if (second === asterisk) {
    input.advance();
    input.advance();

    while (input.next >= 0) {
      if (input.next === asterisk && input.peek(1) === slash) {
        input.advance();
        input.advance();

        return true;
      }

      input.advance();
    }

    return true;
  }

  return false;
}

/**
 * JavaScript between template tags.
 * A "<template>" inside a string or comment does not end the region.
 */
export const jsContent = new ExternalTokenizer((input) => {
  const start = input.pos;

  while (input.next >= 0) {
    if (input.next === lessThan && matchesAt(input, openingTemplateTag)) break;

    if (skipString(input) || skipComment(input)) continue;

    input.advance();
  }

  if (input.pos > start) input.acceptToken(JsContent);
});
