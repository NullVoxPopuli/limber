# Forms

_This demo adapted for [this tweet](https://twitter.com/greg_johnston/status/1605028784071221248) from the `Forms` demo_ (selectable from the menu in the top right).

```gjs live
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';

let initial;
const state = tracked(initial);
const pretty = (data) => JSON.stringify(data, null, 2);

const log = () => {
  // Only log if the data actually change
  // (instead of on focusout)
  let next = pretty(state.value);
  if (initial !== next) {
    console.log(state.value);
    initial = next;
  }
}

const handleInput = (event) => {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());

  state.value = data;
};

const handleSubmit = ( event) => {
  event.preventDefault();
  handleInput(event);
};

<template>
  <form
    {{on 'input' handleInput}}
    {{on 'submit' handleSubmit}}
    {{on 'focusout' log}}
    class="grid gap-2"
    style="max-width: 300px"
  >
    <label> First Name
      <input name='firstName'>
    </label>
    <label> Last Name
      <input name='lastName'>
    </label>

    <label> Include last name in chat
      <input type='checkbox' name='includeLastNameInChat'>
    </label>

    <button type='submit'>Submit</button>
  </form>

  Open the browser console to see logs

  <style>
    input { border: 1px solid; }
  </style>
</template>
```
