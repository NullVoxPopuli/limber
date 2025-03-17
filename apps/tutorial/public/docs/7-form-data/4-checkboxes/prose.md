# Checkboxes in Ember

Checkboxes are HTML input elements with `type="checkbox"`. They allow users to select one or more options from a set, making them essential for collecting boolean values or multiple selections in forms.

## Working with Checkboxes

When working with checkboxes in Ember, it's important to understand:

1. Checkboxes have a `checked` property rather than a `value` property
2. The `value` attribute determines what value is submitted with the form
3. Unchecked checkboxes don't appear in form data at all

## Controlled Checkbox Components

A controlled checkbox component manages the checkbox's state through Ember's reactivity system:

```js
@tracked isChecked = false;

updateCheckbox = (event) => {
  this.isChecked = event.target.checked;
}
```

## Using FormData with Checkboxes

When using FormData to collect form values, checkboxes behave differently than other inputs:

```js
const handleInput = (event) => {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());
  
  // If the checkbox is unchecked, it won't appear in the data object at all
  console.log(data); // { otherField: 'value' } (no checkbox field if unchecked)
  
  // If the checkbox is checked, it will include the value attribute
  console.log(data); // { checkboxField: 'yes', otherField: 'value' }
}
```

## Checkbox Groups

For multiple related checkboxes, you can use the same `name` attribute with different values:

```html
<input type="checkbox" name="fruits" value="apple">
<input type="checkbox" name="fruits" value="banana">
<input type="checkbox" name="fruits" value="orange">
```

When using FormData, you'll need to use `getAll()` to retrieve all selected values:

```js
const selectedFruits = formData.getAll('fruits'); // ['apple', 'orange']
```

<p class="call-to-play">
  Complete the <code>CheckboxDemo</code> component by:
  <ul>
    <li>Implementing a controlled checkbox that updates its state when clicked</li>
    <li>Creating a checkbox group with multiple options</li>
    <li>Displaying the selected values from both the single checkbox and the checkbox group</li>
    <li>Implementing a "Select All" checkbox that toggles all checkboxes in the group</li>
  </ul>
</p>

[Documentation for HTML checkbox input][mdn-checkbox]
[Documentation for FormData][mdn-formdata]
[Documentation for FormData.getAll()][mdn-formdata-getall]

[mdn-checkbox]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox
[mdn-formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[mdn-formdata-getall]: https://developer.mozilla.org/en-US/docs/Web/API/FormData/getAll
