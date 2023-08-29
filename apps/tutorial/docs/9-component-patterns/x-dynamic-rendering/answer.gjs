import { on } from '@ember/modifier';
import { cell } from 'ember-resources';
// shadow-dom component used to get a reset on styling
// this is showcased more prominently in the "Styleguide" demo
import { Shadowed } from 'ember-primitives';

// State that manages the "selected" component
const selected = cell();

// Here are the components used in the MAP.
// these could be imported from other files (co-located, template-only, etc)
const One = <template>The first component</template>;
const Two = <template>The second component</template>;
const Three = <template>The third component</template>;
const Fallback = <template>Fallback / nothing selected</template>;

const MAP = {
'one': One,
'two': Two,
'three': Three,
};

const componentFor = (key) => MAP[key] ?? Fallback;

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
        <label>One   <input name="component" type="radio" value="one"></label><br>
        <label>Two   <input name="component" type="radio" value="two"></label><br>
        <label>Three <input name="component" type="radio" value="three"></label>
      </fieldset>
    </form>

    <br>
    {{#let (componentFor selected.current) as |Selected|}}
      <Selected />
    {{/let}}

  </Shadowed>
</template>
