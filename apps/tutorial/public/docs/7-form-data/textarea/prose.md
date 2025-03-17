# Textarea Inputs in Ember

Textarea elements allow users to input multiple lines of text, making them ideal for comments, descriptions, and other longer-form content. In Ember, textareas can be controlled components just like other form inputs.

## Working with Textareas

When working with textareas in Ember, it's important to understand:

1. Textareas use their content between opening and closing tags as their initial value
2. For controlled components, you should use the `value` attribute instead
3. Textareas can be resized by users by default, but this can be controlled with CSS

## Controlled Textarea Components

A controlled textarea component manages the textarea's value through Ember's reactivity system:

```js
@tracked content = '';

updateContent = (event) => {
  this.content = event.target.value;
}
```

## Using FormData with Textareas

When using FormData to collect form values, textareas work just like other inputs:

```js
const handleSubmit = (event) => {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());
  
  // data.comments will contain the textarea content
  console.log(data.comments);
}
```

## Textarea Features

Textareas support several attributes that can enhance the user experience:

- `rows` and `cols` to set the initial size
- `minlength` and `maxlength` to limit the text length
- `placeholder` to provide a hint
- `readonly` to prevent editing
- `required` to make the field mandatory

<p class="call-to-play">
  Complete the <code>TextareaDemo</code> component by:
  <ul>
    <li>Implementing a controlled textarea that updates its state when the content changes</li>
    <li>Adding character counting functionality to show remaining characters</li>
    <li>Implementing auto-resize functionality to grow the textarea with content</li>
    <li>Creating a form that collects textarea content on submission</li>
  </ul>
</p>

[Documentation for HTML textarea element][mdn-textarea]
[Documentation for FormData][mdn-formdata]
[Documentation for auto-resizing textareas][css-tricks-auto-resize]

[mdn-textarea]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea
[mdn-formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[css-tricks-auto-resize]: https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/
