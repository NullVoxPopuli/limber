// app/routes/application.ts
import Route from '@ember/routing/route';

import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { setupKolay } from 'kolay/setup';

import { createShiki } from '@nullvoxpopuli/limber-shared';

import type { Manifest } from 'kolay';

export default class ApplicationRoute extends Route {
  async model(): Promise<{ manifest: Manifest }> {
    const highlighter = await createShiki();

    const manifest = await setupKolay(this, {
      resolve: {},
      rehypePlugins: [
        [
          rehypeShikiFromHighlighter,
          highlighter,
          {
            theme: 'github-dark',
          },
        ],
      ],
    });

    return { manifest };
  }
}
