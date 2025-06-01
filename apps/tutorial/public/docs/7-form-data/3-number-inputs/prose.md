# Number Inputs in Ember

Number inputs are HTML input elements with `type="number"`. They allow users to enter numeric values and provide built-in validation and UI controls for incrementing and decrementing the value.

## Working with Number Inputs

When working with number inputs in Ember, it's important to understand that:

1. The value from a number input is always a string, even though it represents a number
2. You often need to convert this string to a number using `parseInt()` or `parseFloat()`
3. You can set min, max, and step attributes to control the input behavior

## Controlled Number Input

A controlled number input component manages the input's value through Ember's reactivity system:

```js
@tracked value = 0;

updateValue = (event) => {
  this.value = parseInt(event.target.value, 10);
}
```

## Using FormData with Number Inputs

When using FormData to collect form values, number inputs are still returned as strings:

```js
const handleInput = (event) => {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());
  
  // data.quantity will be a string, not a number
  console.log(typeof data.quantity); // "string"
}
```

<p class="call-to-play">
  Complete the <code>NumberInputDemo</code> component by:
  <ul>
    <li>Adding a controlled number input with min, max, and step attributes</li>
    <li>Implementing the update handler to properly convert the string value to a number</li>
    <li>Adding validation to ensure the value stays within bounds</li>
  </ul>
</p>

[Documentation for HTML number input][mdn-number-input]
[Documentation for parseInt()][mdn-parseint]
[Documentation for FormData][mdn-formdata]

[mdn-number-input]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number
[mdn-parseint]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
[mdn-formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
