import { ExternalTokenizer } from '@lezer/lr';

import {
  commentContent as cmtToken,
  LongExpression as longExprToken,
  longMoustacheCommentContent as longMoustacheCmtToken,
  moustacheCommentContent as moustacheCmtToken,
  ShortExpression as shortExprToken,
} from './syntax.grammar.terms';

import type { InputStream } from '@lezer/lr';

const space = [
  9, 10, 11, 12, 13, 32, 133, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201,
  8202, 8232, 8233, 8239, 8287, 12288,
];

const parenOpen = 40;
const parenClose = 41;
const squareOpen = 91;
const squareClose = 93;
const curlyOpen = 123;
const curlyClose = 125;
const comma = 44;
const colon = 58;
const hash = 35;
const at = 64;
const slash = 47;
const greaterThan = 62;
const dash = 45;
const quoteDouble = 34;
const quoteSingle = 39;
const backslash = 92;
const newline = 10;
const asterisk = 42;
const tick = 96;

const prefixes = [colon, hash, at, slash];

function scanTo(type: number, end: string) {
  return new ExternalTokenizer((input) => {
    for (let endPos = 0, len = 0; ; len++) {
      if (input.next < 0) {
        if (len) input.acceptToken(type);

        break;
      }

      if (input.next == end.charCodeAt(endPos)) {
        endPos++;

        if (endPos == end.length) {
          if (len >= end.length) input.acceptToken(type, 1 - end.length);

          break;
        }
      } else {
        endPos = input.next == end.charCodeAt(0) ? 1 : 0;
      }

      input.advance();
    }
  });
}

export const moustacheCommentContent = scanTo(moustacheCmtToken, '}}');
export const longMoustacheCommentContent = scanTo(longMoustacheCmtToken, '--}}');

export const commentContent = new ExternalTokenizer((input) => {
  for (let dashes = 0, i = 0; ; i++) {
    if (input.next < 0) {
      if (i) input.acceptToken(cmtToken);

      break;
    }

    if (input.next == dash) {
      dashes++;
    } else if (input.next == greaterThan && dashes >= 2) {
      if (i > 3) input.acceptToken(cmtToken, -2);

      break;
    } else {
      dashes = 0;
    }

    input.advance();
  }
});

// TODO: string handler does not handle interpolation

function createStringHandler(input: InputStream) {
  let inString = false;
  let inStringType: 'double' | 'single' | 'template' | null = null;
  let inStringIgnoreNext = false;

  return () => {
    if (inString) {
      if (inStringIgnoreNext) {
        inStringIgnoreNext = false;

        return true;
      }

      if (input.next === backslash) {
        inStringIgnoreNext = true;

        return true;
      }

      if (inStringType === 'double' && input.next === quoteDouble) {
        inString = false;
        inStringType = null;

        return true;
      }

      if (inStringType === 'single' && input.next === quoteSingle) {
        inString = false;
        inStringType = null;

        return true;
      }

      if (inStringType === 'template' && input.next === tick) {
        inString = false;
        inStringType = null;

        return true;
      }

      return true;
    }

    if (input.next === quoteDouble) {
      inString = true;
      inStringType = 'double';

      return true;
    }

    if (input.next === quoteSingle) {
      inString = true;
      inStringType = 'single';

      return true;
    }

    if (input.next === tick) {
      inString = true;
      inStringType = 'template';

      return true;
    }

    return false;
  };
}

function createCommentHandler(input: InputStream) {
  let inLineComment = false;
  let inBlockComment = false;

  return () => {
    if (inLineComment) {
      if (input.next === newline) {
        inLineComment = false;

        return true;
      }

      return true;
    }

    if (inBlockComment) {
      if (input.next === asterisk && input.peek(1) === slash) {
        inBlockComment = false;

        return true;
      }

      return true;
    }

    if (input.next === slash && input.peek(1) === slash) {
      inLineComment = true;

      return true;
    }

    if (input.next === slash && input.peek(1) === asterisk) {
      inBlockComment = true;

      return true;
    }

    return false;
  };
}

// closes on a delimiter that probably isn't in the expression
export const longExpression = new ExternalTokenizer((input) => {
  if (prefixes.includes(input.next)) {
    return;
  }

  const commentHandler = createCommentHandler(input);
  const stringHandler = createStringHandler(input);

  let stack: ('(' | '{' | '[')[] = [];

  const popIfMatch = (match: '(' | '{' | '[') => {
    const idx = stack.lastIndexOf(match);

    if (idx !== -1) {
      while (stack.length > idx) {
        stack.pop();
      }
    }
  };

  for (let pos = 0; ; pos++) {
    // end of input
    if (input.next < 0) {
      if (pos > 0) input.acceptToken(longExprToken);

      break;
    }

    if (commentHandler() || stringHandler()) {
      input.advance();
      continue;
    }

    if (
      stack.length === 0 &&
      (input.next === curlyClose || input.next === parenClose || input.next === squareClose)
    ) {
      input.acceptToken(longExprToken);

      break;
    }

    // prettier-ignore
    switch (input.next) {
      case parenOpen:   stack.push("(");

 break
      case parenClose:  popIfMatch("(");

 break
      case squareOpen:  stack.push("[");

 break
      case squareClose: popIfMatch("[");

 break
      case curlyOpen:   stack.push("{");

 break
      case curlyClose:  popIfMatch("{");

 break
    }

    input.advance();
  }
});

// same as long expression but will close on either a space or comma
// that is reasonably not inside of the expression
export const shortExpression = new ExternalTokenizer((input) => {
  if (prefixes.includes(input.peek(0))) {
    return;
  }

  const commentHandler = createCommentHandler(input);
  const stringHandler = createStringHandler(input);

  let stack: ('(' | '{' | '[')[] = [];

  const popIfMatch = (match: '(' | '{' | '[') => {
    const idx = stack.lastIndexOf(match);

    if (idx !== -1) {
      while (stack.length > idx) {
        stack.pop();
      }
    }
  };

  for (let pos = 0; ; pos++) {
    // end of input
    if (input.next < 0) {
      if (pos > 0) input.acceptToken(shortExprToken);

      break;
    }

    if (commentHandler() || stringHandler()) {
      input.advance();
      continue;
    }

    if (
      stack.length === 0 &&
      (input.next === curlyClose ||
        input.next === parenClose ||
        input.next === squareClose ||
        input.next === comma)
    ) {
      input.acceptToken(shortExprToken);

      break;
    }

    // prettier-ignore
    switch (input.next) {
      case parenOpen:   stack.push("(");

 break
      case parenClose:  popIfMatch("(");

 break
      case squareOpen:  stack.push("[");

 break
      case squareClose: popIfMatch("[");

 break
      case curlyOpen:   stack.push("{");

 break
      case curlyClose:  popIfMatch("{");

 break
    }

    if (pos !== 0 && stack.length === 0 && space.includes(input.next)) {
      input.acceptToken(shortExprToken);

      break;
    }

    input.advance();
  }
});
