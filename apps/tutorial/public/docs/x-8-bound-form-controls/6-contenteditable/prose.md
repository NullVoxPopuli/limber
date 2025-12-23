# Contenteditable Elements in Ember

Contenteditable elements allow users to edit content directly within HTML elements. Unlike traditional form inputs, contenteditable can be applied to any HTML element, enabling rich text editing and custom editing experiences.

## Working with Contenteditable Elements

When working with contenteditable elements in Ember, it's important to understand:

1. Any HTML element can be made editable with the `contenteditable` attribute
2. Contenteditable elements don't use the `value` property like form inputs
3. Content is accessed through the `innerHTML` or `textContent` properties
4. The `input` event fires when the user modifies the content

## Controlled Contenteditable Elements

A controlled contenteditable element manages its content through Ember's reactivity system:

```js
@tracked content = 'This is editable content.';

updateContent = (event) => {
  this.content = event.target.innerHTML;
}
```

```hbs
<div 
  contenteditable="true" 
  {{on "input" this.updateContent}}
>
  {{this.content}}
</div>
```

## Handling HTML Content

One challenge with contenteditable elements is that they can contain HTML markup:

```js
@tracked htmlContent = '<p>This is <strong>formatted</strong> content.</p>';

updateHtmlContent = (event) => {
  this.htmlContent = event.target.innerHTML;
}

get safeContent() {
  return htmlSafe(this.htmlContent);
}
```

## Creating Rich Text Editors

Contenteditable elements can be used to create rich text editors:

```js
@tracked editorContent = '<p>Start typing here...</p>';

formatBold = () => {
  document.execCommand('bold', false, null);
}

formatItalic = () => {
  document.execCommand('italic', false, null);
}

updateEditorContent = (event) => {
  this.editorContent = event.target.innerHTML;
}
```

<p class="call-to-play">
  Complete the <code>ContenteditableDemo</code> component by:
  <ul>
    <li>Implementing a controlled contenteditable element that updates its state when the content changes</li>
    <li>Creating a simple rich text editor with formatting controls</li>
    <li>Adding a live preview that displays the formatted content</li>
    <li>Implementing a way to extract and display the plain text version of the content</li>
  </ul>
</p>

[Documentation for contenteditable attribute][mdn-contenteditable]
[Documentation for execCommand][mdn-execcommand]
[Documentation for Ember htmlSafe][ember-htmlsafe]

[mdn-contenteditable]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
[mdn-execcommand]: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
[ember-htmlsafe]: https://api.emberjs.com/ember/release/functions/@ember%2Ftemplate/htmlSafe
