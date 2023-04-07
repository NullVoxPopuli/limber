import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

let state = cell();

let initialData = {
  numberField: 10
};

function parse(data) {
  let result = { ...data };

  if ('numberField' in data) {
    result.numberField = parseInt(data.numberField, 10);
  }

  return result;
}

function handleInput(event) {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());

  state.current = JSON.stringify({ ...data, type: typeof data.numberField }, null, 2);
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
      Some number
      <input type='number' name='numberField' value={{initialData.numberField}}>
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
