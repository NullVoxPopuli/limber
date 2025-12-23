# Select Inputs in Ember

Select inputs (dropdowns) allow users to choose from a predefined list of options. In Ember, working with select inputs requires understanding how to manage the selected value and handle option changes.

## Working with Select Inputs

When working with select inputs in Ember, it's important to understand:

1. The `value` attribute of a select element represents the currently selected option
2. Options can be dynamically generated from an array of data
3. The `change` event fires when the user selects a different option
4. You can use tracked properties to maintain the selected value

## Controlled Select Inputs

A controlled select input manages its value through Ember's reactivity system:

```js
@tracked selectedValue = 'option1';

updateSelection = (event) => {
  this.selectedValue = event.target.value;
}
```

## Generating Options Dynamically

You can generate options dynamically from an array of data:

```js
options = [
  { id: 'option1', label: 'Option 1' },
  { id: 'option2', label: 'Option 2' },
  { id: 'option3', label: 'Option 3' }
];

@tracked selectedValue = this.options[0].id;
```

```hbs
<select value={{this.selectedValue}} {{on "change" this.updateSelection}}>
  {{#each this.options as |option|}}
    <option value={{option.id}}>{{option.label}}</option>
  {{/each}}
</select>
```

## Option Groups

Select inputs can also include option groups for better organization:

```js
optionGroups = [
  {
    label: 'Group 1',
    options: [
      { id: 'option1', label: 'Option 1' },
      { id: 'option2', label: 'Option 2' }
    ]
  },
  {
    label: 'Group 2',
    options: [
      { id: 'option3', label: 'Option 3' },
      { id: 'option4', label: 'Option 4' }
    ]
  }
];
```

```hbs
<select value={{this.selectedValue}} {{on "change" this.updateSelection}}>
  {{#each this.optionGroups as |group|}}
    <optgroup label={{group.label}}>
      {{#each group.options as |option|}}
        <option value={{option.id}}>{{option.label}}</option>
      {{/each}}
    </optgroup>
  {{/each}}
</select>
```

<p class="call-to-play">
  Complete the <code>SelectInputDemo</code> component by:
  <ul>
    <li>Implementing a controlled select input that updates its state when the selection changes</li>
    <li>Creating a dynamic select with options generated from an array</li>
    <li>Adding option groups for better organization</li>
    <li>Implementing a cascading select where the options of one select depend on the selection of another</li>
  </ul>
</p>

[Documentation for HTML select element][mdn-select]
[Documentation for HTML optgroup element][mdn-optgroup]
[Documentation for Ember tracked properties][ember-tracked]
[Documentation for Ember actions][ember-actions]

[mdn-select]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
[mdn-optgroup]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup
[ember-tracked]: https://guides.emberjs.com/release/in-depth-topics/autotracking-in-depth/
[ember-actions]: https://guides.emberjs.com/release/components/component-state-and-actions/
