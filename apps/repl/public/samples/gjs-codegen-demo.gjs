// EXPERIMENTAL: this format compiles <template>s directly to DOM operations
// (no wire format, no VM). Strict mode only.
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { trackedArray } from '@ember/reactive/collections';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
// A component compiled for the VM (from an addon): rendered by the VM,
// with the attributes and block from this compiled template.
import { ExternalLink } from 'ember-primitives';

const shout = (text) => `${text.toUpperCase()}!`;

const Card = <template>
  <section class="card" ...attributes>
    <h2>{{yield to="title"}}</h2>
    {{#if (has-block "body")}}
      {{yield to="body"}}
    {{else}}
      <p>(no body)</p>
    {{/if}}
  </section>
</template>;

class Counter extends Component {
  @tracked count = 0;

  increment = (by) => (this.count += by);

  <template>
    <button type="button" {{on "click" (fn this.increment @step)}}>
      +{{@step}}
    </button>
    <output>{{this.count}}</output>
    {{#if (eq this.count 0)}}
      <span>Click it!</span>
    {{else if (gt this.count 10)}}
      <span>{{shout "that's a lot"}}</span>
    {{/if}}
  </template>
}

class Todos extends Component {
  todos = trackedArray([
    { id: 1, title: 'Compile templates to JS' },
    { id: 2, title: 'Delete the VM?' },
    { id: 3, title: 'Measure it' },
  ]);

  reverse = () => this.todos.reverse();
  remove = (todo) => this.todos.splice(this.todos.indexOf(todo), 1);

  <template>
    <button type="button" {{on "click" this.reverse}}>Reverse</button>
    <ul>
      {{#each this.todos key="id" as |todo i|}}
        <li>
          {{i}}: {{todo.title}}
          <button type="button" {{on "click" (fn this.remove todo)}}>×</button>
        </li>
      {{else}}
        <li>All done</li>
      {{/each}}
    </ul>
  </template>
}

<template>
  <Card class="counter">
    <:title>Counter</:title>
    <:body><Counter @step={{2}} /></:body>
  </Card>

  <Card>
    <:title>Todos</:title>
    <:body><Todos /></:body>
  </Card>

  <Card><:title>Empty</:title></Card>

  <Card>
    <:title>From an addon</:title>
    <:body>
      <ExternalLink href="https://github.com/emberjs/ember.js/pull/21649" class="pr-link">
        The ember.js PR
      </ExternalLink>
    </:body>
  </Card>

  <style>
    .card { border: 1px solid #ccc; border-radius: 0.5rem; padding: 0.5rem 1rem; margin: 1rem 0; }
  </style>
</template>
