# Form Input Change Events in Ember

When working with forms in Ember, it's important to understand how to handle input change events to create responsive and interactive user interfaces. The `on` modifier provides a way to attach event listeners to DOM elements, including form inputs.

## The `on` Modifier

The `on` modifier allows you to attach event listeners to elements in your templates:

```js
<input {{on "input" this.handleInput}}>
```

This attaches an event listener for the `input` event to the input element, which will call the `handleInput` function whenever the input value changes.

## Common Form Events

When working with forms, there are several events you might want to handle:

1. **input**: Fires whenever the value of an input element changes
2. **change**: Fires when the value is committed (e.g., when focus leaves the input)
3. **submit**: Fires when a form is submitted
4. **focusout**: Fires when an element loses focus

## Using FormData

The `FormData` API provides a convenient way to collect form values:

```js
const handleInput = (event) => {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());
  
  // data now contains all form field values
  console.log(data);
};
```

## Real-time Form Updates

To create a form that updates in real-time as the user types, you can use the `input` event:

```js
import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

const state = cell({});

const handleInput = (event) => {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());
  
  state.current = data;
};

<template>
  <form {{on 'input' handleInput}}>
    <input name="firstName">
    <input name="lastName">
  </form>
  
  <pre>{{JSON.stringify(state.current, null, 2)}}</pre>
</template>
```

<p class="call-to-play">
  Complete the <code>FormChangeEvents</code> component by:
  <ul>
    <li>Implementing event handlers for both 'input' and 'change' events</li>
    <li>Displaying the form data in real-time as the user types</li>
    <li>Adding a submit handler that prevents the default form submission</li>
    <li>Implementing a focusout handler to log when fields lose focus</li>
  </ul>
</p>

[Documentation for the on modifier][ember-on-modifier]
[Documentation for FormData][mdn-formdata]
[Documentation for form events][mdn-form-events]

[ember-on-modifier]: https://guides.emberjs.com/release/components/template-lifecycle-dom-and-modifiers/#toc_event-handlers
[mdn-formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[mdn-form-events]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event
