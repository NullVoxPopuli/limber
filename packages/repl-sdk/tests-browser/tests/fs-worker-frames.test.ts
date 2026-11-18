import { wrap } from 'comlink';
import { describe, expect, test } from 'vitest';

import type { FsWorker } from '../../src/fs/worker.js';

/**
 * Each REPL frame on a page gets its own worker, like the docs page that
 * embeds many REPLs.
 */
function frameWorker() {
  const instance = new Worker(new URL('../../src/fs-worker.js', import.meta.url), {
    type: 'module',
  });

  return { worker: wrap(instance) as unknown as FsWorker, instance };
}

describe('two frames share one origin file system', () => {
  test('both write the same entry file at once', async () => {
    const a = frameWorker();
    const b = frameWorker();

    try {
      const writes = [];

      for (let i = 0; i < 20; i++) {
        writes.push(a.worker.write('/src/frames-test.gjs', `a ${i}`));
        writes.push(b.worker.write('/src/frames-test.gjs', `b ${i}`));
      }

      const results = await Promise.allSettled(writes);
      const failed = results.filter((result) => result.status === 'rejected');

      expect(failed).toEqual([]);
    } finally {
      a.instance.terminate();
      b.instance.terminate();
    }
  });
});
