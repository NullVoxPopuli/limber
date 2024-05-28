import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class ControlledInput extends Component {
  <template>
    <fieldset>
      <legend>Favorite Race</legend>
      <label>
        Zerg
        <input
          type="radio" name="bestRace" value="zerg"
        />
      </label>
      <label>
        Protoss
        <input
          type="radio" name="bestRace" value="protoss"
        />
      </label>
      <label>
        Terran
        <input
          type="radio" name="bestRace" value="terran"
        />
      </label>
    </fieldset>
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
    fieldset > label {
      display: block;
    }
  </style>

</template>

