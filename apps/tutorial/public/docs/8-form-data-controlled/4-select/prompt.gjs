import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class ControlledInput extends Component {
  <template>
    <label>
      Favorite Color
      <select>
        <option value="red">Red</option>
        <option value="orange">Orange</option>
        <option value="yellow">Yellow</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
        <option value="purple">Purple</option>
      </select>
    </label>
  </template>
}

// Below is only setup for the tutorial chapter 
// and not exactly relevent to the topic
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
    select { border: 1px solid; }
  </style>
</template>

