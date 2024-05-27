import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class ControlledInput extends Component {
  handleChange = (event) => {
    let radio = event.target;

    this.args.onChange(radio.value);
  }

  isChecked = (value) => this.args.value === value

  <template>
    <fieldset>
      <legend>Favorite Race</legend>
      <label>
        Zerg
        <input
          type="radio" name="bestRace" value="zerg"
          checked={{this.isChecked "zerg"}}
          {{on 'change' this.handleChange}}
        />
      </label>
      <label>
        Protoss
        <input
          type="radio" name="bestRace" value="protoss"
          checked={{this.isChecked "protoss"}}
          {{on 'change' this.handleChange}}
        />
      </label>
      <label>
        Terran
        <input
          type="radio" name="bestRace" value="terran"
          checked={{this.isChecked "terran"}}
          {{on 'change' this.handleChange}}
        />
      </label>
    </fieldset>
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
    fieldset > label {
      display: block;
    }
  </style>

</template>

