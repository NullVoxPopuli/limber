# Radio Inputs in Ember

Radio inputs are HTML input elements with `type="radio"`. They allow users to select exactly one option from a set of choices, making them ideal for mutually exclusive selections.

## Working with Radio Inputs

When working with radio inputs in Ember, it's important to understand:

1. Radio inputs with the same `name` attribute form a group
2. Only one radio input in a group can be selected at a time
3. The `value` attribute determines what value is submitted with the form
4. The `checked` attribute determines which radio is initially selected

## Controlled Radio Components

A controlled radio component manages the radio group's state through Ember's reactivity system:

```js
@tracked selectedOption = 'option1';

updateSelection = (event) => {
  this.selectedOption = event.target.value;
}
```

## Using FormData with Radio Inputs

When using FormData to collect form values, only the selected radio input's value is included:

```js
const handleSubmit = (event) => {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());
  
  // data.preference will be the value of the selected radio input
  console.log(data.preference); // "option1"
}
```

## Radio Input Accessibility

For better accessibility, always:

1. Group related radio inputs inside a `fieldset` with a descriptive `legend`
2. Associate each radio input with a `label` using the `for` attribute
3. Ensure radio inputs can be navigated and selected using the keyboard

<p class="call-to-play">
  Complete the <code>RadioInputDemo</code> component by:
  <ul>
    <li>Implementing a controlled radio group that updates its state when a selection is made</li>
    <li>Displaying the currently selected option</li>
    <li>Creating a form that uses radio inputs and collects the selected value on submission</li>
    <li>Ensuring the radio inputs are accessible with proper labeling and grouping</li>
  </ul>
</p>

[Documentation for HTML radio input][mdn-radio]
[Documentation for FormData][mdn-formdata]
[Documentation for radio input accessibility][mdn-radio-accessibility]

[mdn-radio]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio
[mdn-formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[mdn-radio-accessibility]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radio_role
