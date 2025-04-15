# Conditional Attribute Rendering

In Ember/Glimmer templates, you can conditionally render attributes based on certain conditions. This is particularly useful for:

- Toggling CSS classes
- Setting ARIA attributes
- Conditionally applying styles
- Enabling/disabling form elements

## Using Inline If for Attributes

The inline `{{if}}` helper is perfect for conditional attribute rendering:

```hbs
<div class="{{if isActive 'active' 'inactive'}}">Content</div>
```

You can also use it for boolean attributes:

```hbs
<button disabled={{if isLoading true false}}>Submit</button>
```

Or even more concisely:

```hbs
<button disabled={{isLoading}}>Submit</button>
```

## Combining Multiple Conditions

For more complex conditions, you can combine helpers:

```hbs
<div 
  class="card {{if isHighlighted 'highlighted'}} {{if isSelected 'selected'}}"
  aria-selected={{isSelected}}
>
  Content
</div>
```

<p class="call-to-play">
  Complete the <code>ConditionalAttributes</code> component by implementing the missing conditional attributes:
  <ul>
    <li>Add a conditional class to the button based on its state</li>
    <li>Add a conditional disabled attribute to the button when loading</li>
    <li>Add conditional ARIA attributes to the notification based on its visibility</li>
  </ul>
</p>

[Documentation for if helper][docs-if]
[Documentation for class attribute binding][docs-class-binding]

[docs-if]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/if?anchor=if
[docs-class-binding]: https://guides.emberjs.com/release/components/template-lifecycle-dom-and-modifiers/#toc_class-and-attribute-bindings
