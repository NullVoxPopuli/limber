import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class ControlledInput extends Component {
  handleChange = (event) => {
    let select = event.target;

    this.args.onChange(select.value);
  }

  isSelected = (value) => this.args.value === value

  <template>
    <label>
      Favorite Color
      <select {{on 'change' this.handleChange}}>
        <option value="red" selected={{this.isSelected "red"}}>Red</option>
        <option value="orange" selected={{this.isSelected "orange"}}>Orange</option>
        <option value="yellow" selected={{this.isSelected "yellow"}}>Yellow</option>
        <option value="green" selected={{this.isSelected "green"}}>Green</option>
        <option value="blue" selected={{this.isSelected "blue"}}>Blue</option>
        <option value="purple" selected={{this.isSelected "purple"}}>Purple</option>
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

