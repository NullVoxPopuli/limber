import { assert as debugAssert } from '@ember/debug';
import { click, currentURL, find, visit, waitUntil } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { isCollection } from 'kolay';

// We can't use this until we switch to Vite and tests can remain real modules.
// (so that the import gets all the way to the browser)
//
//// SAFETY: TS will never be happy with imports from the public / root directory
////
//// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//import manifestJson from '/docs/manifest.json' with { type: 'json' };
//import type { Manifest } from 'tutorial/services/types';
//const manifest: Manifest = manifestJson;
import { tmpData } from './tmp';

import type { Manifest } from 'kolay';

const manifest = tmpData as Manifest;

module('every tutorial chapter', function (hooks) {
  setupApplicationTest(hooks);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  for (const section of manifest.groups[0]!.tree.pages) {
    if (!isCollection(section)) continue;

    for (const chapter of section.pages) {
      const name = chapter.path.replace(/\/prose\.md$/, '');

      const fullPath = `/${section.path}/${name}`;

      // every page except the last one (99-next-steps/1-congratulations)
      // should have a "next" button
      const isLast = fullPath === '/99-next-steps/1-congratulations';

      // also anything starting with /x- isn't ready for folks to ese
      // nor test
      if (fullPath.startsWith('/x-')) continue;
      if (name.startsWith('x-')) continue;
      if (fullPath.endsWith('.md')) continue;
      if (fullPath.includes('/x-')) continue;

      if (isLast) {
        test(`Visiting ${fullPath}`, async function (assert) {
          await visit(fullPath);
          assert.strictEqual(currentURL(), fullPath, `visited ${fullPath}`);
        });
      } else {
        test(`Visiting ${fullPath}`, async function (assert) {
          await visit(fullPath);
          assert.strictEqual(currentURL(), fullPath, `visited ${fullPath}`);

          const previous = currentURL();

          // every page except the last one (99-next-steps/1-congratulations)
          // should have a "next" button
          await waitUntil(() => this.owner.lookup('service:selected').isReady, {
            timeoutMessage: 'Selected service was never ready',
          });

          const nextLink = find('[data-test-next]');

          debugAssert(`Next link is missing`, nextLink);

          const actualHref = nextLink?.getAttribute('href');

          debugAssert(`Expected href of [data-test-next] to exist`, actualHref);

          assert.notStrictEqual(
            actualHref,
            fullPath,
            `${actualHref} is not ${fullPath}`
          );
          await click('[data-test-next]');

          const current = currentURL();

          assert.notEqual(
            current,
            previous,
            `Navigated from ${previous} to ${current}`
          );
        });
      }
    }
  }
});
