import {
  ALLOWED_FORMATS,
  fromParent,
  hasAllowedFormat,
  hasContent,
  hasFormat,
  parseEvent,
} from 'limber/utils/messaging';

import type { FromParent } from 'limber/utils/messaging';

interface Context {
  error: string | null;
  onError?: (error: string | Error) => void;
}

class MessageFormatError extends Error {}

export function iframeMessageHandler(ctx: Context) {
  return (event: MessageEvent) => {
    let parsed = parseEvent(event);

    if (!fromParent(parsed)) {
      return;
    }

    try {
      let data = verify(parsed);

      return data.content;
    } catch (e) {
      ctx.error = e;
    }

    return;
  };
}

const hasCorrectTypes = (x: {
  format: unknown;
  content: unknown;
}): x is { format: string; content: string } => {
  return typeof x.format === 'string' && typeof x.content === 'string';
};

function verify(parsed: object): FromParent {
  if (!fromParent(parsed)) {
    throw new Error('Message not from parent. Not valid input');
  }

  if (!hasFormat(parsed)) {
    throw new MessageFormatError('received JSON message does not have a type property');
  }

  if (!hasContent(parsed)) {
    throw new MessageFormatError('received JSON message does not have a content property');
  }

  if (!hasCorrectTypes(parsed)) {
    throw new MessageFormatError(`values for format or content are not correct`);
  }

  if (!hasAllowedFormat(parsed)) {
    throw new MessageFormatError(
      `received type property in JSON message is not a support type. Supported types include: ${ALLOWED_FORMATS.join(
        ', '
      )}`
    );
  }

  return parsed;
}
