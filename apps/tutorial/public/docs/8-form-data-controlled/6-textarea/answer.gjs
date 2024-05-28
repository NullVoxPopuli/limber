import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class ControlledInput extends Component {
  handleChange = (event) => {
    let textarea = event.target;

    this.args.onChange(textarea.value);
  }

  <template>
    <label>
      Why do you like colors?
      <textarea {{on 'input' this.handleChange}}>{{@value}}</textarea>
    </label>
  </template>
}

// Below is only setup for the tutorial chapter
// and not exactly relevent to the topic
class State {
  @tracked value = "initial text";
  handleChange = (newValue) => this.value = newValue;
}
const createState = () => new State();


<template>
  {{#let (createState) as |x|}}
    <ControlledInput @value={{x.value}} @onChange={{x.handleChange}} />

    <pre>{{x.value}}</pre>
  {{/let}}


  <style>
    textarea { 
      border: 1px solid; 
      display: block;
      padding: 0.25rem;
    }
  </style>
</template>

