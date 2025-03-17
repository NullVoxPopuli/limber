# Textarea Inputs in Ember

Textarea inputs allow users to enter multi-line text content. In Ember, working with textarea inputs requires understanding how to manage the content and handle changes.

## Working with Textarea Inputs

When working with textarea inputs in Ember, it's important to understand:

1. Textareas are designed for multi-line text input
2. The content is managed through the `value` attribute
3. The `input` and `change` events fire when the user modifies the content
4. You can use tracked properties to maintain the textarea content

## Controlled Textarea Inputs

A controlled textarea input manages its value through Ember's reactivity system:

```js
@tracked textContent = '';

updateContent = (event) => {
  this.textContent = event.target.value;
}
```

```hbs
<textarea 
  value={{this.textContent}} 
  {{on "input" this.updateContent}}
></textarea>
```

## Handling Line Breaks and Formatting

Textareas preserve line breaks and whitespace, which can be important for certain types of content:

```js
@tracked formattedContent = '';

get displayContent() {
  // Replace line breaks with HTML line breaks for display
  return this.formattedContent.replace(/\n/g, '<br>');
}
```

## Auto-resizing Textareas

You can create auto-resizing textareas that adjust their height based on content:

```js
adjustHeight = (element) => {
  // Reset height to auto to get the correct scrollHeight
  element.style.height = 'auto';
  // Set the height to match the content
  element.style.height = `${element.scrollHeight}px`;
}

updateWithResize = (event) => {
  this.textContent = event.target.value;
  this.adjustHeight(event.target);
}
```

<p class="call-to-play">
  Complete the <code>TextareaInputDemo</code> component by:
  <ul>
    <li>Implementing a controlled textarea input that updates its state when the content changes</li>
    <li>Creating a live preview that displays the formatted content</li>
    <li>Adding an auto-resizing textarea that adjusts its height based on content</li>
    <li>Implementing a character counter and maximum length indicator</li>
  </ul>
</p>

[Documentation for HTML textarea element][mdn-textarea]
[Documentation for Ember tracked properties][ember-tracked]
[Documentation for Ember actions][ember-actions]

[mdn-textarea]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea
[ember-tracked]: https://guides.emberjs.com/release/in-depth-topics/autotracking-in-depth/
[ember-actions]: https://guides.emberjs.com/release/components/component-state-and-actions/
