import { Code } from 'limber-ui';

const counter = `import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class HelloWorld extends Component {
  @tracked count = 0;

  increment = () => this.count += 1;

  <template>
    <p>You have clicked the button {{this.count}} times.</p>

    <button type="button" {{on "click" this.increment}}>Click</button>
  </template>
}
`;

<template>

<h1>Embedding</h1>

  <Code @code={{counter}} />
  </template>;
