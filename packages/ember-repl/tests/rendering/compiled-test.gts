import { tracked } from '@glimmer/tracking';
import { hash } from '@ember/helper';
import { renderSettled } from '@ember/renderer';
import { render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';

import { Compiled } from '#src/index.ts';

import { setupCompiler } from '#src/test-support.ts';

module('Rendering | Compiled()', function (hooks) {
  setupRenderingTest(hooks);
  setupCompiler(hooks);

  test('it works', async function (assert) {
    const doc = stripIndent`
      hello there
    `;

    void render(
      <template>
        {{#let (Compiled doc "md") as |state|}}
          <div id="ready">{{state.isReady}}</div>
          <div id="error">{{if
              state.error
              (JSON.stringify state.error)
              ""
            }}</div>
          <div id="component">
            {{#if state.component}}
              <state.component />
            {{else}}
              component is missing
              {{log "DEBUG: component is missing" state state.component}}
            {{/if}}
          </div>
        {{/let}}
      </template>
    );

    await renderSettled();
    assert.dom('#ready').hasText('false');
    assert.dom('#error').hasNoText();
    assert.dom('#component').hasText('component is missing');

    await settled();
    assert.dom('#ready').hasText('true');
    assert.dom('#error').hasNoText();
    assert.dom('#component').hasText('hello there');
  });

  test('forwards args to a compiled gjs component', async function (assert) {
    const doc = stripIndent`
      <template>
        <output>hello {{@name}}</output>
      </template>
    `;

    const args = { name: 'world' };

    void render(
      <template>
        {{#let (Compiled doc "gjs" undefined (hash args=args)) as |state|}}
          {{#if state.component}}
            <state.component />
          {{/if}}
        {{/let}}
      </template>
    );

    await settled();
    assert.dom('output').hasText('hello world');
  });

  test('reactive args propagate without recompilation', async function (assert) {
    const doc = stripIndent`
      <template>
        <output>hello {{@name}}</output>
      </template>
    `;

    class State {
      @tracked name = 'world';
    }

    // A stable args reference whose values read from tracked state.
    const state = new State();
    const args = {
      get name() {
        return state.name;
      },
    };

    void render(
      <template>
        {{#let (Compiled doc "gjs" undefined (hash args=args)) as |compiled|}}
          {{#if compiled.component}}
            <compiled.component />
          {{/if}}
        {{/let}}
      </template>
    );

    await settled();
    assert.dom('output').hasText('hello world');

    state.name = 'friend';
    await settled();
    assert.dom('output').hasText('hello friend');
  });
});
