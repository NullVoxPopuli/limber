import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { setupApplicationCompilerTest } from '#tests/helpers.ts';

module('Errors', function (hooks) {
  setupApplicationCompilerTest(hooks);
  test('attempts to visit non-existant page', async function (assert) {
    // NOTE: lack of ? is intentional here, as this is a
    //     real mistake I made during debugging.
    await visit('/docs/embedding&local');

    // Previously, this would infinite loop
    //
    // preparing to transition from '' to 'error'
    // Transition #90468: detected abort.
    // Transition #90469: detected abort.
    // Attempting URL transition to /
    // Transition #90471: error: transition was aborted
    // Transition #90470: detected abort.
    // Attempting transition to edit
    // Transition #90472: index: transition was aborted
    // URL contained no document information in the SearchParams. Assuming glimdown and using the default sample snippet.
    // Transition #90473: edit: transition was aborted
    // Attempting URL transition to /docs/embedding&local?format=gmd&c=blahblah
    // ::repeat::
    assert.dom().containsText('ope!');
    assert.dom().containsText(currentURL());
  });
});
