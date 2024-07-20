import { click, currentURL, visit } from '@ember/test-helpers';
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
  for (let section of manifest.groups[0]!.tree.pages) {
    if (!isCollection(section)) continue;

    for (let chapter of section.pages) {
      let name = chapter.path.replace(/\/prose\.md$/, '');
      // every page except the last one (99-next-steps/1-congratulations)
      // should have a "next" button
      let isLast = name === '/99-next-steps/1-congratulations';

      // also anything starting with /x- isn't ready for folks to ese
      // nor test
      if (name.startsWith('/x-')) continue;

      if (isLast) {
        test(`Visiting ${name}`, async function (assert) {
          await visit(chapter.path);
          assert.strictEqual(currentURL(), chapter.path, `visited ${chapter.path}`);
        });
      } else {
        test(`Visiting ${name}`, async function (assert) {
          await visit(chapter.path);
          assert.strictEqual(currentURL(), chapter.path, `visited ${chapter.path}`);

          let previous = currentURL();

          // every page except the last one (99-next-steps/1-congratulations)
          // should have a "next" button

          await click('[data-test-next]');

          let current = currentURL();

          assert.notEqual(current, previous, `Navigated from ${previous} to ${current}`);
        });
      }
    }
  }
});
