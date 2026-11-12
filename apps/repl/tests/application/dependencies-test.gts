import { click, currentURL, fillIn, find, findAll, visit, waitUntil } from '@ember/test-helpers';
import { VERSION } from '@ember/version';
import QUnit, { module, test } from 'qunit';

import { getCompiler } from 'ember-repl';
import LZString from 'lz-string';

import { Output } from '#components/output.gts';
import { PinnedOutput } from '#components/pinned-output.gts';
import { Dependencies } from '#edit/dependencies.gts';
import { setupApplicationCompilerTest } from '#tests/helpers.ts';

const { compressToEncodedURIComponent } = LZString;

const open = '[data-dependencies-button]';
const name = '[data-test-dependency-name]';
const version = '[data-test-dependency-version]';
const loaded = '[data-test-dependency-loaded]';
const apply = '[data-test-apply-dependencies]';
const out = '[data-test-compiled-output] [data-test-text]';

/**
 * The row of the dialog for a package.
 */
function rowOf(packageName: string) {
  const names = findAll(name).map((el) => (el as HTMLInputElement).value);
  const index = names.indexOf(packageName);

  return {
    names,
    index,
    version: findAll(version)[index],
    loaded: findAll(loaded)[index],
  };
}

/**
 * dompurify has no dependencies and says which version loaded.
 */
const doc = `
import DOMPurify from 'dompurify';

<template><p data-test-text>{{DOMPurify.version}}</p></template>
`;

/**
 * ember-resources is bundled with the REPL.
 */
const usesBundle = `
import { cell } from 'ember-resources';

const value = cell(2);

<template><p data-test-text>{{value.current}}</p></template>
`;

const noImports = `<template><p data-test-text>no imports</p></template>`;

function visitWith(deps?: string, text = doc) {
  const qps = new URLSearchParams({ format: 'gjs', c: compressToEncodedURIComponent(text) });

  if (deps) qps.set('deps', deps);

  return visit(`/edit?${qps.toString()}`);
}

module('Editor > Dependencies', function (hooks) {
  setupApplicationCompilerTest(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:editor').setCodemirrorState = () => {};

    this.owner.register(
      'template:edit',
      <template>
        <Dependencies />
        <Output @shadow={{false}} />
      </template>
    );
  });

  test('the deps query param pins the version', async function (assert) {
    await visitWith('dompurify@3.2.0');

    assert.dom(out).hasText('3.2.0');
  });

  test('the dialog shows the pins from the URL', async function (assert) {
    await visitWith('dompurify@3.2.0');
    await click(open);

    assert.dom(name).hasValue('dompurify');
    assert.dom(version).hasValue('3.2.0');
    assert.dom(loaded).hasText('3.2.0');
  });

  test('the dialog lists what loaded without a pin', async function (assert) {
    await visitWith();

    const latest = (document.querySelector(out)?.textContent ?? '').trim();

    assert.true(/^\d+\.\d+\.\d+/.test(latest), `the output shows a version: ${latest}`);

    await click(open);

    const row = rowOf('dompurify');

    assert.notStrictEqual(row.index, -1, `dompurify has a row: ${row.names.join(', ')}`);
    assert.dom(row.version).hasValue('', 'no pin');
    assert.dom(row.loaded).hasText(latest);
  });

  test('the dialog lists bundled packages with their version', async function (assert) {
    await visitWith();
    await click(open);

    const row = rowOf('ember-source');

    assert.notStrictEqual(row.index, -1, `ember-source has a row: ${row.names.join(', ')}`);
    assert.dom(row.version).hasAttribute('placeholder', 'bundled');
    assert.dom(row.loaded).hasText(VERSION, 'with the version that runs');
  });

  test('a pin replaces a bundled package', async function (assert) {
    await visitWith(undefined, usesBundle);

    assert.dom(out).hasText('2');

    await click(open);

    const row = rowOf('ember-resources');

    assert.dom(row.version).hasAttribute('placeholder', 'bundled');

    const bundled = row.loaded?.textContent?.trim();

    assert.notStrictEqual(bundled, '7.0.0', `the bundle is not 7.0.0: ${bundled}`);

    await fillIn(row.version as Element, '7.0.0');
    await click(apply);

    assert.dom(out).hasText('2', 'the npm copy renders too');

    await click(open);

    assert.dom(rowOf('ember-resources').loaded).hasText('7.0.0');
  });

  test('applying a new version compiles against it', async function (assert) {
    await visitWith('dompurify@3.2.0');
    await click(open);
    await fillIn(version, '3.1.0');
    await click(apply);

    assert.true(
      currentURL().includes(`deps=${encodeURIComponent('dompurify@3.1.0')}`),
      'the URL has the new pin'
    );
    assert.dom(out).hasText('3.1.0');
  });

  test('a new pin keeps the other packages listed', async function (assert) {
    await visitWith(undefined, `${usesBundle}\nimport DOMPurify from 'dompurify';`);
    await click(open);

    const before = rowOf('').names.sort();

    assert.true(before.includes('dompurify'), `dompurify has a row: ${before.join(', ')}`);
    assert.true(before.includes('ember-resources'), 'ember-resources has a row');

    await fillIn(rowOf('dompurify').version as Element, '3.1.0');
    await click(apply);
    await click(open);

    assert.deepEqual(rowOf('').names.sort(), before);
    assert.dom(rowOf('dompurify').loaded).hasText('3.1.0');
  });

  test('a package can be added and removed', async function (assert) {
    await visitWith(undefined, noImports);
    await click(open);
    await waitUntil(() => rowOf('ember-source').index !== -1);

    assert.deepEqual(rowOf('').names, ['ember-source'], 'a template loads ember-source');

    await click('[data-test-add-dependency]');

    assert.strictEqual(findAll(name).length, 2);

    await fillIn(findAll(name)[1] as Element, 'dompurify');
    await fillIn(findAll(version)[1] as Element, '3.1.0');
    await click(apply);

    assert.true(
      currentURL().includes(`deps=${encodeURIComponent('dompurify@3.1.0')}`),
      'a row with no version adds nothing'
    );

    await click(open);
    await click(findAll('[data-test-remove-dependency]')[rowOf('dompurify').index] as Element);
    await click(apply);

    assert.false(currentURL().includes('deps='), 'no pins leaves no query param');
  });

  test('a document with no packages has a blank row', async function (assert) {
    await visit(`/edit?format=md&c=${compressToEncodedURIComponent('# no imports')}`);
    await click(open);

    assert.deepEqual(rowOf('').names, [''], 'the blank row');
  });
});

module('Output > pinned ember-source', function (hooks) {
  setupApplicationCompilerTest(hooks);

  const versionDoc = `
import { VERSION } from '@ember/version';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class Demo extends Component {
  @tracked count = 0;
  inc = () => this.count++;

  <template>
    <p data-test-text>{{VERSION}}</p>
    <button type="button" data-test-count {{on "click" this.inc}}>{{this.count}}</button>
  </template>
}
`;

  test('the output runs on the pinned ember-source', async function (assert) {
    /**
     * The oldest version that can be pinned.
     */
    const qps = new URLSearchParams({
      format: 'gjs',
      deps: 'ember-source@6.10.0',
      c: compressToEncodedURIComponent(versionDoc),
    });

    await visit(`/output?${qps.toString()}`);

    assert.dom('[data-test-text]').hasText('6.10.0');
    assert.notStrictEqual(VERSION, '6.10.0', 'the host runs another version');
    assert.dom('[data-test-edit-this]').exists('the output page alone links to the editor');

    await click('[data-test-count]');

    /**
     * settled() waits for the host's Ember, not the pinned one.
     */
    await waitUntil(() => find('[data-test-count]')?.textContent === '1');

    assert.dom('[data-test-count]').hasText('1', 'tracked state renders');
  });

  test('the edit page renders a pinned ember-source in a frame', async function (assert) {
    this.owner.lookup('service:editor').setCodemirrorState = () => {};

    const qps = new URLSearchParams({
      format: 'gjs',
      deps: 'ember-source@7.4.0',
      c: compressToEncodedURIComponent(versionDoc),
    });

    await visit(`/edit?${qps.toString().replace('ember-source%407.4.0', 'dompurify%403.2.0')}`);

    assert.dom('[data-test-pinned-output]').doesNotExist('other pins render in the page');
    assert.dom('[title^="Toggle Shadow DOM"]').exists('the page has the shadow DOM toggle');

    await visit(`/edit?${qps.toString()}`);

    const frame = find('[data-test-pinned-output]') as HTMLIFrameElement | null;
    const inFrame = (selector: string) => frame?.contentDocument?.querySelector(selector);

    assert.ok(frame, 'the output is a frame');
    assert.dom('[title^="Toggle Shadow DOM"]').doesNotExist('the frame has no shadow DOM toggle');

    await waitUntil(() => inFrame('[data-test-text]')?.textContent === '7.4.0', {
      timeout: 30_000,
    });

    assert.strictEqual(inFrame('[data-test-text]')?.textContent, '7.4.0');
    assert.notOk(inFrame('[data-test-edit-this]'), 'the frame has no edit link');

    const before = frame?.contentDocument;

    this.owner
      .lookup('service:editor')
      .updateText(versionDoc.replace('{{VERSION}}', 'v{{VERSION}}'));

    await waitUntil(() => inFrame('[data-test-text]')?.textContent === 'v7.4.0', {
      timeout: 30_000,
    });

    assert.strictEqual(frame?.contentDocument, before, 'typing does not reload the frame');
  });

  test('the frame loads again only for a new ember-source pin', async function (assert) {
    this.owner.lookup('service:editor').setCodemirrorState = () => {};

    const bothVersions = `
import { VERSION } from '@ember/version';
import DOMPurify from 'dompurify';

<template><p data-test-text>{{VERSION}} {{DOMPurify.version}}</p></template>
`;

    /**
     * The editor keeps its text after the first visit, so only the pins change.
     */
    const pin = (deps: string) =>
      visit(
        `/edit?${new URLSearchParams({ format: 'gjs', deps, c: compressToEncodedURIComponent(bothVersions) }).toString()}`
      );

    await pin('ember-source@7.4.0,dompurify@3.2.0');

    const frame = find('[data-test-pinned-output]') as HTMLIFrameElement | null;
    const textIs = (text: string) =>
      waitUntil(
        () => frame?.contentDocument?.querySelector('[data-test-text]')?.textContent === text,
        { timeout: 30_000 }
      );

    await textIs('7.4.0 3.2.0');

    const first = frame?.contentDocument;

    assert.step('7.4.0 3.2.0');

    await pin('ember-source@7.4.0,dompurify@3.1.0');
    await textIs('7.4.0 3.1.0');

    assert.strictEqual(frame?.contentDocument, first, 'another pin reuses the frame');
    assert.step('7.4.0 3.1.0');

    await pin('ember-source@6.10.0,dompurify@3.1.0');
    await textIs('6.10.0 3.1.0');

    assert.notStrictEqual(frame?.contentDocument, first, 'a new ember-source loads a new frame');
    assert.step('6.10.0 3.1.0');

    assert.verifySteps(['7.4.0 3.2.0', '7.4.0 3.1.0', '6.10.0 3.1.0']);
  });

  test('pinning ember-source keeps the list while the frame loads', async function (assert) {
    this.owner.lookup('service:editor').setCodemirrorState = () => {};

    await visit(`/edit?format=gjs&c=${compressToEncodedURIComponent(versionDoc)}`);
    await click(open);

    const before = rowOf('').names.sort();

    assert.deepEqual(before, ['@glimmer/component', 'decorator-transforms', 'ember-source']);

    await fillIn(rowOf('ember-source').version as Element, '7.4.0');
    await click(apply);
    await waitUntil(() => !find('dialog.dependencies-drawer')?.hasAttribute('open'));
    await click(open);

    assert.deepEqual(rowOf('').names.sort(), before, 'the frame has not compiled yet');

    await waitUntil(() => rowOf('ember-source').loaded?.textContent === '7.4.0', {
      timeout: 30_000,
    });

    assert.deepEqual(rowOf('').names.sort(), before, 'the frame lists the same packages');
  });

  test('the dialog lists what the frame loaded', async function (assert) {
    this.owner.lookup('service:editor').setCodemirrorState = () => {};

    this.owner.register(
      'template:edit',
      <template>
        <Dependencies />
        <PinnedOutput />
      </template>
    );

    const qps = new URLSearchParams({
      format: 'gjs',
      deps: 'ember-source@7.4.0',
      c: compressToEncodedURIComponent(versionDoc),
    });

    await visit(`/edit?${qps.toString()}`);

    /**
     * Open before the frame loads, so the list must fill in while the drawer is open.
     */
    await click(open);

    const loadedIn = (packageName: string, text: string) =>
      waitUntil(() => rowOf(packageName).loaded?.textContent === text, { timeout: 30_000 });

    await loadedIn('ember-source', '7.4.0');
    await waitUntil(() => rowOf('@glimmer/component').index !== -1, { timeout: 30_000 });

    const row = rowOf('ember-source');

    assert.dom(row.version).hasValue('7.4.0');
    assert.dom(row.loaded).hasText('7.4.0');
    assert.true(row.names.includes('@glimmer/component'), 'addons load from npm too');

    const before = row.names.sort();

    await fillIn(row.version as Element, '6.10.0');
    await click(apply);

    const frame = find('[data-test-pinned-output]') as HTMLIFrameElement | null;

    await waitUntil(
      () => frame?.contentDocument?.querySelector('[data-test-text]')?.textContent === '6.10.0',
      { timeout: 30_000 }
    );

    await click(open);
    await loadedIn('ember-source', '6.10.0');
    await waitUntil(() => rowOf('').names.length === before.length, { timeout: 30_000 });

    assert.deepEqual(rowOf('').names.sort(), before, 'a new frame lists the same packages');
  });

  test('markdown on a pinned ember-source gets its default scope', async function (assert) {
    const markdown = [
      '# Pinned',
      '',
      '{{#let (hash name="hash") as |h|}}<span data-test-text>{{h.name}}</span>{{/let}}',
      '',
      '{{#each (array "a" "b") as |x|}}<span data-test-item>{{x}}</span>{{/each}}',
    ].join('\n');

    const qps = new URLSearchParams({
      format: 'gmd',
      deps: 'ember-source@7.4.0',
      c: compressToEncodedURIComponent(markdown),
    });

    await visit(`/output?${qps.toString()}`);

    await waitUntil(() => findAll('[data-test-item]').length === 2, { timeout: 30_000 });

    assert.dom('[data-test-text]').hasText('hash');
    assert.deepEqual(
      findAll('[data-test-item]').map((item) => item.textContent),
      ['a', 'b']
    );
  });

  test('an ember-source without an ES module template compiler explains why', async function (assert) {
    const qps = new URLSearchParams({
      format: 'gjs',
      deps: 'ember-source@6.4.0',
      c: compressToEncodedURIComponent(versionDoc),
    });

    /**
     * Nobody awaits a failed compile, so the browser reports an unhandled rejection,
     * which is how the REPL shows the error. QUnit fails tests on those.
     */
    const onUncaughtException = QUnit.onUncaughtException;

    QUnit.onUncaughtException = () => {};

    try {
      await visit(`/output?${qps.toString()}`);

      const compiler = getCompiler(this.owner);

      await waitUntil(() => compiler.lastError, { timeout: 30_000 });

      assert.true(
        compiler.lastError?.message.includes('6.10 or newer'),
        compiler.lastError?.message
      );
      assert.dom('[data-test-error]').includesText('6.10 or newer', 'the output page shows it');
    } finally {
      QUnit.onUncaughtException = onUncaughtException;
    }
  });
});
