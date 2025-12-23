# Contenteditable Elements in Ember

The `contenteditable` attribute allows users to edit the content of an HTML element directly in the browser. This provides a rich editing experience without requiring a traditional form input like a textarea.

## Working with Contenteditable

When working with contenteditable elements in Ember, it's important to understand:

1. Contenteditable elements don't have a `value` property like form inputs
2. You need to use the element's `innerHTML` or `textContent` to get or set the content
3. Contenteditable elements don't automatically participate in form submissions
4. You need to handle events like `input` to track changes

## Controlled Contenteditable Components

A controlled contenteditable component manages the element's content through Ember's reactivity system:

```js
@tracked content = 'Initial content';

updateContent = (event) => {
  this.content = event.target.innerHTML;
}
```

## Handling Rich Content

Contenteditable elements can contain rich HTML content, including formatting:

```html
<div contenteditable="true" class="rich-editor">
  <p>This is <strong>rich</strong> content with <em>formatting</em>.</p>
</div>
```

To preserve this formatting when updating the content, you should use `innerHTML` rather than `textContent`.

## Integrating with Forms

Since contenteditable elements don't participate in form submissions, you need to manually include their content:

```js
const handleSubmit = (event) => {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  
  // Add the contenteditable content to the form data
  const editorContent = document.querySelector('.rich-editor').innerHTML;
  formData.append('richContent', editorContent);
  
  // Process the form data
  const data = Object.fromEntries(formData.entries());
  console.log(data);
}
```

<p class="call-to-play">
  Complete the <code>ContenteditableDemo</code> component by:
  <ul>
    <li>Implementing a controlled contenteditable element that updates its state when the content changes</li>
    <li>Creating a simple toolbar to add basic formatting (bold, italic, underline)</li>
    <li>Displaying a preview of the HTML content</li>
    <li>Implementing a form that includes the contenteditable content on submission</li>
  </ul>
</p>

[Documentation for contenteditable attribute][mdn-contenteditable]
[Documentation for execCommand (for formatting)][mdn-execcommand]
[Documentation for FormData][mdn-formdata]

[mdn-contenteditable]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
[mdn-execcommand]: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
[mdn-formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
