import type { HighlightRequest, HighlightResponse } from '#app/workers/shiki.ts';
import type { Root } from 'hast';

type Pending = {
  resolve: (result: HighlightResponse['result']) => void;
  reject: (error: Error) => void;
};

const pending = new Map<number, Pending>();

let worker: Worker | undefined;
let nextId = 0;

/**
 * Starts the download of the worker (and Shiki with it).
 * Call this early, so that the download runs beside the downloads of the page.
 */
export function startHighlighter() {
  if (worker) return worker;

  worker = new Worker(new URL('../workers/shiki.ts', import.meta.url), {
    name: 'shiki',
    type: 'module',
  });

  worker.onmessage = (event: MessageEvent<HighlightResponse>) => {
    const { id, result, error } = event.data;
    const request = pending.get(id);

    pending.delete(id);

    if (error) {
      request?.reject(new Error(error));

      return;
    }

    request?.resolve(result);
  };

  return worker;
}

function request(message: Omit<HighlightRequest, 'id'>) {
  const id = nextId++;

  return new Promise<HighlightResponse['result']>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    startHighlighter().postMessage({ ...message, id });
  });
}

/**
 * Resolves to undefined when Shiki does not have the language.
 */
export async function highlightToHtml(code: string, lang: string) {
  return (await request({ as: 'html', code, lang })) as string | undefined;
}

/**
 * Resolves to undefined when Shiki does not have the language.
 */
export async function highlightToHast(code: string, lang: string, meta?: string) {
  return (await request({ as: 'hast', code, lang, meta })) as Root | undefined;
}
