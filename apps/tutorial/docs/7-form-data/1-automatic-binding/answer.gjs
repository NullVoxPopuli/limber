import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

let state = cell();

function handleInput(event) {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());

  state.current = JSON.stringify(data, null, 2);
}

function handleSubmit(event) {
  event.preventDefault();
  handleInput(event);
}

<template>
  <form
    {{on 'input' handleInput}}
    {{on 'submit' handleSubmit}}
    id="demo"
  >
    <label>
      First Name
      <input name='firstName'>
    </label>

    <button type='submit'>Submit</button>
  </form>

  <br><br>

  FormData:
  <pre>{{state.current}}</pre>

  <style>
    #demo {
      display: grid;
      gap: 0.5rem;
      max-width: 300px;
    }
    #demo input { border: 1px solid; }
  </style>
</template>
