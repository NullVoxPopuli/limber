# Dynamic Rendering in Ember

Dynamic rendering is a powerful pattern that allows you to conditionally render different components based on runtime conditions. This approach enables more flexible and adaptable user interfaces that can change their presentation based on data, user preferences, or application state.

## Understanding Dynamic Rendering

When working with dynamic rendering in Ember, it's important to understand:

1. Components can be dynamically selected at runtime
2. You can use the `component` helper to render components by name
3. Component names can be stored in variables or computed properties
4. You can pass arguments to dynamically rendered components

## Basic Dynamic Rendering

The simplest form of dynamic rendering uses the `component` helper:

```hbs
{{component this.componentName}}
```

Where `componentName` is a string that corresponds to a component name:

```js
@tracked componentName = 'info-panel';
```

## Passing Arguments to Dynamic Components

You can pass arguments to dynamically rendered components:

```hbs
{{component this.componentName
  title=this.title
  content=this.content
  onAction=this.handleAction
}}
```

## Conditional Component Selection

You can use computed properties to determine which component to render:

```js
get displayComponent() {
  if (this.isLoading) {
    return 'loading-spinner';
  } else if (this.hasError) {
    return 'error-message';
  } else if (this.isEmpty) {
    return 'empty-state';
  } else {
    return 'data-display';
  }
}
```

```hbs
{{component this.displayComponent data=this.data}}
```

<p class="call-to-play">
  Complete the <code>DynamicRenderingDemo</code> component by:
  <ul>
    <li>Implementing a component that dynamically renders different UI components based on a selection</li>
    <li>Creating a set of simple components that can be dynamically rendered</li>
    <li>Adding controls to change which component is rendered</li>
    <li>Implementing a way to pass different arguments to the dynamically rendered components</li>
  </ul>
</p>

[Documentation for component helper][ember-component-helper]
[Documentation for conditional rendering][ember-conditional-rendering]
[Documentation for computed properties][ember-computed-properties]

[ember-component-helper]: https://guides.emberjs.com/release/components/component-arguments-and-html-attributes/#toc_dynamic-component-invocation
[ember-conditional-rendering]: https://guides.emberjs.com/release/components/conditional-content/
[ember-computed-properties]: https://guides.emberjs.com/release/components/template-lifecycle-dom-and-modifiers/#toc_computed-properties
