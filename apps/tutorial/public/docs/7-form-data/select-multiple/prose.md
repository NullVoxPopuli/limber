# Multiple Select Inputs in Ember

Multiple select inputs allow users to select multiple options from a dropdown list. This is useful for scenarios where users need to choose several items from a predefined set of options.

## Working with Multiple Select Inputs

When working with multiple select inputs in Ember, it's important to understand:

1. Add the `multiple` attribute to enable multiple selection
2. The selected options are available as an array-like object in `event.target.selectedOptions`
3. You need to convert this to an array to work with it effectively
4. When using FormData, you need to use `getAll()` to retrieve all selected values

## Controlled Multiple Select Components

A controlled multiple select component manages the selection state through Ember's reactivity system:

```js
@tracked selectedOptions = [];

updateSelection = (event) => {
  // Convert the HTMLCollection to an array of values
  this.selectedOptions = Array.from(event.target.selectedOptions).map(option => option.value);
}
```

## Using FormData with Multiple Select

When using FormData to collect form values with multiple select inputs:

```js
const handleSubmit = (event) => {
  let formData = new FormData(event.currentTarget);
  
  // Use getAll() to retrieve all selected values
  const selectedOptions = formData.getAll('options');
  
  console.log(selectedOptions); // ['option1', 'option3', 'option4']
}
```

## Styling Multiple Select Inputs

Multiple select inputs can be styled to improve usability:

```css
select[multiple] {
  min-height: 150px;
  padding: 0.5rem;
}

select[multiple] option {
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
}

select[multiple] option:checked {
  background-color: #3498db;
  color: white;
}
```

<p class="call-to-play">
  Complete the <code>MultiSelectDemo</code> component by:
  <ul>
    <li>Implementing a controlled multiple select that updates its state when selections change</li>
    <li>Displaying the currently selected options</li>
    <li>Creating a form that uses a multiple select and collects the selected values on submission</li>
    <li>Adding custom styling to improve the usability of the multiple select</li>
  </ul>
</p>

[Documentation for HTML select element with multiple attribute][mdn-select-multiple]
[Documentation for FormData][mdn-formdata]
[Documentation for FormData.getAll()][mdn-formdata-getall]

[mdn-select-multiple]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple
[mdn-formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[mdn-formdata-getall]: https://developer.mozilla.org/en-US/docs/Web/API/FormData/getAll
