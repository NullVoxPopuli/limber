# Checkboxes in Ember

## Controlled Checkbox

```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class Demo extends Component {
  @tracked value;

  update = (event) => this.value = event.target.checked;
  
  <template>
    {{this.value}}<br>
    <label> 
      the checkbox
  
      <input 
        type="checkbox"
        checked={{this.value}} 
        class="border"
        {{on 'change' this.update}} 
      />
    </label>
  </template>
}
```

## Automatic binding using a `<form>`

```gjs live
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';
import { cell } from 'ember-resources';

let state = cell();

const handleInput = (event) => {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());

  state.current = JSON.stringify(data, null, 2);
};

const handleSubmit = ( event) => {
  event.preventDefault();
  handleInput(event);
};

<template>
  <form 
    {{on 'input' handleInput}} 
    {{on 'submit' handleSubmit}}
    class="grid gap-2" 
    style="max-width: 300px"
  >
    <label> isChecked
      <input type="checkbox" value="totally checked" name='isChecked'>
    </label>

    <button type='submit'>Submit</button>
  </form>

  <br><br>

  FormData:
  <pre>{{state.current}}</pre>

</template>
```
