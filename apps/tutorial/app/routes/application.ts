// app/routes/application.ts
import Route from '@ember/routing/route';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { setupKolay } from 'kolay/setup';

import {
  rehypeShikiWorker,
  startHighlighter,
} from '@nullvoxpopuli/limber-shared/highlighting';

import type { Manifest } from 'kolay';

export default class ApplicationRoute extends Route {
  async model(): Promise<{ manifest: Manifest }> {
    startHighlighter();

    const manifest = await setupKolay(this, {
      rehypePlugins: [rehypeShikiWorker],
    });

    return { manifest };
  }
}
