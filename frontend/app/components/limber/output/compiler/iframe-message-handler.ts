interface Context {
  error: string | null;
  onError?: (error: string | Error) => void;
}

export type Type = 'glimdown' | 'gjs' | 'hbs';
type Data = {
  type: Type;
  content: string;
  from: 'limber';
};

export const DEFAULT_FORMAT = 'glimdown' as const;

const ALLOWED_FORMATS = [DEFAULT_FORMAT, 'gjs', 'hbs'] as const;

export const isAllowedFormat = (x?: string): x is Type =>
  Boolean(x && (ALLOWED_FORMATS as readonly string[]).includes(x));

class MessageFormatError extends Error {}

export function iframeMessageHandler(ctx: Context) {
  return (event: MessageEvent) => {
    let data: Data;
    let parsed: object = {};

    try {
      parsed = JSON.parse(event.data);
    } catch (e) {
      console.debug('Unrecognized message data');
    }

    if (!isFromParent(parsed)) {
      return;
    }

    try {
      data = verify(parsed);

      return data.content;
    } catch (e) {
      ctx.error = e;
    }

    return;
  };
}

const isFromParent = (x?: object): boolean => {
  if (hasFrom(x)) {
    return x.from === 'limber';
  }

  return false;
};

const hasFrom = (x?: object): x is { from: unknown } => Boolean(x && 'from' in x);
const hasType = (x?: object): x is { type: unknown } => Boolean(x && 'type' in x);
const hasContent = (x?: object): x is { content: unknown } => Boolean(x && 'content' in x);
const hasCorrectTypes = (x: {
  type: unknown;
  content: unknown;
}): x is { type: string; content: string } => {
  return typeof x.type === 'string' && typeof x.content === 'string';
};
const hasAllowedFormat = (x: { type: string; content: string }): x is Data =>
  isAllowedFormat(x.type);

function verify(parsed: object): Data {
  if (!hasType(parsed)) {
    throw new MessageFormatError('received JSON message does not have a type property');
  }

  if (!hasContent(parsed)) {
    throw new MessageFormatError('received JSON message does not have a content property');
  }

  if (!hasCorrectTypes(parsed)) {
    throw new MessageFormatError(`value types for ${parsed.type} were not correct`);
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
