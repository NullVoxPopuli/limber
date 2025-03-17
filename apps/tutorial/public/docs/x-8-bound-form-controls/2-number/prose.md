# Number Inputs in Ember

Number inputs are specialized form controls designed to handle numeric values. In Ember, working with number inputs requires understanding how to properly handle type conversion between strings and numbers.

## Working with Number Inputs

When working with number inputs in Ember, it's important to understand:

1. HTML number inputs return string values, even though they appear to handle numbers
2. You need to explicitly convert between strings and numbers
3. Number inputs have special attributes like `min`, `max`, and `step`
4. Validation is important to ensure numeric values are within expected ranges

## Controlled Number Inputs

A controlled number input manages its value through Ember's reactivity system:

```js
@tracked numericValue = 0;

updateValue = (event) => {
  // Convert string to number
  this.numericValue = Number(event.target.value);
}
```

## Handling Empty Values

One challenge with number inputs is handling empty values:

```js
@tracked numericValue = null;

updateValue = (event) => {
  const value = event.target.value;
  
  // Handle empty input
  if (value === '') {
    this.numericValue = null;
  } else {
    this.numericValue = Number(value);
  }
}
```

## Input Constraints and Validation

Number inputs support constraints through HTML attributes:

```html
<input 
  type="number" 
  min="0" 
  max="100" 
  step="5"
  value={{this.numericValue}} 
  {{on "input" this.updateValue}}
>
```

You can also implement custom validation:

```js
@tracked numericValue = 0;
@tracked error = null;

validateValue = (event) => {
  const value = Number(event.target.value);
  
  if (isNaN(value)) {
    this.error = 'Please enter a valid number';
  } else if (value < 0) {
    this.error = 'Value cannot be negative';
  } else if (value > 100) {
    this.error = 'Value cannot exceed 100';
  } else {
    this.numericValue = value;
    this.error = null;
  }
}
```

<p class="call-to-play">
  Complete the <code>NumberInputDemo</code> component by:
  <ul>
    <li>Implementing controlled number inputs with proper type conversion</li>
    <li>Adding validation to ensure values are within specified ranges</li>
    <li>Creating a numeric slider with synchronized value display</li>
    <li>Implementing a calculator that performs operations on numeric inputs</li>
  </ul>
</p>

[Documentation for HTML number input element][mdn-number-input]
[Documentation for Number object in JavaScript][mdn-number]
[Documentation for Ember tracked properties][ember-tracked]

[mdn-number-input]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number
[mdn-number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[ember-tracked]: https://guides.emberjs.com/release/in-depth-topics/autotracking-in-depth/
