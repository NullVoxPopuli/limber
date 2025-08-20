# Standalone Form Inputs in Ember

Standalone form inputs are form controls that aren't part of a traditional `<form>` element but still provide user interaction. These inputs can be useful for creating dynamic interfaces where data is processed immediately rather than on form submission.

## Working with Standalone Inputs

When working with standalone inputs in Ember, it's important to understand:

1. Inputs can exist outside of a `<form>` element and still function properly
2. You can use the same event handlers (`input`, `change`, etc.) as with form-bound inputs
3. Standalone inputs are ideal for immediate feedback and real-time validation
4. You can still use tracked properties to maintain the input state

## Controlled Standalone Inputs

A controlled standalone input manages its value through Ember's reactivity system:

```js
@tracked inputValue = '';

updateValue = (event) => {
  this.inputValue = event.target.value;
}
```

## Immediate Feedback with Standalone Inputs

One advantage of standalone inputs is the ability to provide immediate feedback:

```js
@tracked inputValue = '';
@tracked isValid = true;
@tracked errorMessage = '';

validateInput = (event) => {
  this.inputValue = event.target.value;
  
  if (this.inputValue.length < 3) {
    this.isValid = false;
    this.errorMessage = 'Input must be at least 3 characters';
  } else {
    this.isValid = true;
    this.errorMessage = '';
  }
}
```

## Combining Multiple Standalone Inputs

You can combine multiple standalone inputs to create complex interfaces:

```js
@tracked firstName = '';
@tracked lastName = '';
@tracked email = '';

get fullName() {
  return `${this.firstName} ${this.lastName}`.trim();
}

get isFormComplete() {
  return this.firstName && this.lastName && this.email;
}
```

<p class="call-to-play">
  Complete the <code>StandaloneInputsDemo</code> component by:
  <ul>
    <li>Implementing controlled standalone inputs for text, number, and checkbox types</li>
    <li>Adding real-time validation with immediate feedback</li>
    <li>Creating a dynamic preview that updates as the user interacts with the inputs</li>
    <li>Implementing a submit action that processes the collected data</li>
  </ul>
</p>

[Documentation for HTML input element][mdn-input]
[Documentation for Ember tracked properties][ember-tracked]
[Documentation for Ember actions][ember-actions]

[mdn-input]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
[ember-tracked]: https://guides.emberjs.com/release/in-depth-topics/autotracking-in-depth/
[ember-actions]: https://guides.emberjs.com/release/components/component-state-and-actions/
