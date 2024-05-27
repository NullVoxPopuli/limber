import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class ControlledInput extends Component {
  handleChange = (event) => {
    let input = event.target;
    let value = Boolean(input.checked);

    this.args.onChange(value);
  }

  <template>
     <label>
        Example input
        <input
          type="checkbox"
          checked={{this.value}}
          {{on 'change' this.handleChange}} />
      </label>
  </template>
}

class State {
  @tracked value;
  handleChange = (newValue) => this.value = newValue;
}
const createState = () => new State();

<template>
  {{#let (createState) as |x|}}
    <ControlledInput @value={{x.value}} @onChange={{x.handleChange}} />

    <pre>{{x.value}}</pre>
  {{/let}}

  <style>
    input {
      border: 1px solid;
      padding: 0.25rem 0.5rem;
    }
  </style>
</template>

