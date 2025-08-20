# Radio Inputs in Ember

Radio inputs allow users to select a single option from a predefined set of choices. In Ember, working with radio inputs requires understanding how to manage the selected value and handle changes.

## Working with Radio Inputs

When working with radio inputs in Ember, it's important to understand:

1. Radio inputs with the same `name` attribute form a group where only one can be selected
2. The `checked` attribute determines which radio input is selected
3. The `value` attribute defines the value associated with each option
4. You can use tracked properties to maintain the selected value

## Controlled Radio Inputs

A controlled radio input group manages its value through Ember's reactivity system:

```js
@tracked selectedValue = 'option1';

updateSelection = (event) => {
  this.selectedValue = event.target.value;
}
```

```hbs
<div class="radio-group">
  <label>
    <input 
      type="radio" 
      name="options" 
      value="option1" 
      checked={{eq this.selectedValue "option1"}} 
      {{on "change" this.updateSelection}}
    >
    Option 1
  </label>
  
  <label>
    <input 
      type="radio" 
      name="options" 
      value="option2" 
      checked={{eq this.selectedValue "option2"}} 
      {{on "change" this.updateSelection}}
    >
    Option 2
  </label>
</div>
```

## Generating Radio Inputs Dynamically

You can generate radio inputs dynamically from an array of data:

```js
options = [
  { id: 'option1', label: 'Option 1' },
  { id: 'option2', label: 'Option 2' },
  { id: 'option3', label: 'Option 3' }
];

@tracked selectedValue = this.options[0].id;
```

```hbs
<div class="radio-group">
  {{#each this.options as |option|}}
    <label>
      <input 
        type="radio" 
        name="options" 
        value={{option.id}} 
        checked={{eq this.selectedValue option.id}} 
        {{on "change" this.updateSelection}}
      >
      {{option.label}}
    </label>
  {{/each}}
</div>
```

## Styling Radio Inputs

Radio inputs can be styled to improve usability and match your application's design:

```css
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Custom radio appearance */
.custom-radio {
  position: relative;
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #ccc;
  border-radius: 50%;
}

.custom-radio::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: #3498db;
  opacity: 0;
  transition: opacity 0.2s;
}

input[type="radio"]:checked + .custom-radio::after {
  opacity: 1;
}

/* Hide the actual radio input */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

<p class="call-to-play">
  Complete the <code>RadioInputDemo</code> component by:
  <ul>
    <li>Implementing a controlled radio input group that updates its state when a selection is made</li>
    <li>Creating a dynamic radio group with options generated from an array</li>
    <li>Adding custom styling to improve the appearance of the radio inputs</li>
    <li>Implementing a form that collects and processes the selected radio value</li>
  </ul>
</p>

[Documentation for HTML radio input element][mdn-radio]
[Documentation for Ember tracked properties][ember-tracked]
[Documentation for Ember actions][ember-actions]

[mdn-radio]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio
[ember-tracked]: https://guides.emberjs.com/release/in-depth-topics/autotracking-in-depth/
[ember-actions]: https://guides.emberjs.com/release/components/component-state-and-actions/
