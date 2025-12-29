import { module, test } from 'qunit';

import { setupApplicationCompilerTest } from '#tests/helpers.ts';

import { Page } from './-page';

function makeDanger(danger: string) {
  return `${danger}

<template>
  hi
</template>
`;
}

module('Danger Protection', function (hooks) {
  setupApplicationCompilerTest(hooks);

  const page = new Page();

  test('blocks use of open(', async function (assert) {
    const badText = makeDanger(`open(whatever)`);

    await page.visitEdit('gjs', badText);

    assert.dom('[data-test-output]').containsText('Would you like to run the code?');
  });

  test('blocks use of location.href=', async function (assert) {
    const badText = makeDanger(`location.href='uwutm8'`);

    await page.visitEdit('gjs', badText);

    assert.dom('[data-test-output]').containsText('Would you like to run the code?');
  });

  test('blocks use of location.href =', async function (assert) {
    const badText = makeDanger(`location.href ='uwutm8'`);

    await page.visitEdit('gjs', badText);

    assert.dom('[data-test-output]').containsText('Would you like to run the code?');
  });
});
