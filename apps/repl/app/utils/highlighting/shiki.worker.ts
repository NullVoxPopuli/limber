/**
 * Shiki runs here, so that highlighting never blocks the main thread.
 */
import { highlight } from './shiki.ts';

import type { HighlightRequest, HighlightResponse } from './shiki.ts';

self.onmessage = async (event: MessageEvent<HighlightRequest>) => {
  const { id } = event.data;
  let response: HighlightResponse;

  try {
    response = { id, result: await highlight(event.data) };
  } catch (e) {
    response = { id, error: e instanceof Error ? e.message : String(e) };
  }

  self.postMessage(response);
};
