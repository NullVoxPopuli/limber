import { on } from '@ember/modifier';
import { cell } from 'ember-resources';
// shadow-dom componentt used to get a reset on styling
// this is showcased more prominently in the "Styleguide" demo
import Shadowed from 'limber/components/shadowed';

// State that manages the "selected" component
const selected = cell();

// Here are the components used in the MAP.
// these could be imported from other files (co-located, template-only, etc)
const One = <template>One</template>;
const Two = <template>Two</template>;
const Three = <template>Three</template>;
const Fallback = <template>Fallback / nothing selecetd</template>;

const MAP = {
  'one': One,
  'two': Two,
  'three': Three,
};

// This is a helper, as all functions are helpers
const componentFor = (key) => MAP[key] ?? Fallback;

// This way of dealing with form/input event binding is demonstrated
// in the "Forms" demo in the "Select demo" menu at the top of the screen
const handleInput = (event) => {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());

  selected.current = data.component;
}
const handleSubmit = ( event) => {
  event.preventDefault();
  handleInput(event);
};

<template>
  <Shadowed @omitStyles={{true}}>
    <form {{on 'input' handleInput}} {{on 'submit' handleSubmit}}>
      <fieldset>
        <legend>Choose a component</legend>
        <label>One   <input name="component" type="radio" value="one"></label>
        <label>Two   <input name="component" type="radio" value="two"></label>
        <label>Three <input name="component" type="radio" value="three"></label>
      </fieldset>
    </form>

    <br>
    {{#let (componentFor selected.current) as |Selected|}}
      <Selected />
    {{/let}}
  </Shadowed>
</template>
