/**
 * An error message, split for the status bar.
 */
export interface ErrorSummary {
  /**
   * One line.
   */
  summary: string;

  /**
   * Lines that point at the source text.
   * A syntax error shows these at all times, because the context helps.
   */
  frame?: string;

  /**
   * The rest of the message and the stack, shown on request.
   */
  details?: string;
}

/**
 * The compilers name the file of the document after their own pipeline,
 * and the template compiler does not know the module name or the line.
 */
const NOISE = [
  /^\/dynamic-repl\.\w+: /,
  /\s*\(error occurred in 'an unknown module' @ line \d+ : column \d+\)\s*$/,
];

/**
 * content-tag:
 *
 *   Parse Error at dynamic-repl.gjs:1:11: 1:12
 *
 *     × Expression expected
 *      ╭─[dynamic-repl.gjs:1:1]
 *    1 │ const x = ;
 *      ·           ─
 *      ╰────
 */
const PARSE_ERROR = /^Parse Error at [^:]+:(\d+):(\d+)/;

/**
 * Lines of source text with a gutter, such as `1 │ code`, `|  code`, or a `---^` marker.
 */
const FRAME_LINE = /^\s*(\d*\s*[│·╭╰]|\||-+\^|\.\.\.)/;

export function summarize(message: string, error?: unknown): ErrorSummary {
  let text = message;

  for (const noise of NOISE) {
    text = text.replace(noise, '');
  }

  const lines = text.split('\n');
  const parseError = PARSE_ERROR.exec(text);

  if (parseError) {
    const reason = lines.find((line) => line.trim().startsWith('×'));

    return {
      summary: `${reason?.trim().slice(1).trim() ?? 'Parse error'} (line ${parseError[1]}, column ${parseError[2]})`,
      frame: lines.filter((line) => FRAME_LINE.test(line)).join('\n'),
    };
  }

  const [first = '', ...others] = lines;
  const rest = others.join('\n').trim();
  const summary = first.replace(/:\s*$/, '');

  /**
   * The lines around a frame, such as what the parser expected, belong with it.
   * The stack of a syntax error only names compiler internals.
   */
  if (others.some((line) => FRAME_LINE.test(line))) {
    return { summary, frame: rest };
  }

  const details = [rest, stackOf(error)].filter(Boolean).join('\n\n');

  return { summary, details: details || undefined };
}

function stackOf(error: unknown) {
  if (!(error instanceof Error) || !error.stack) return;

  /**
   * V8 starts the stack with the message, and Firefox does not.
   */
  return error.stack.replace(`${error.name}: ${error.message}\n`, '');
}
