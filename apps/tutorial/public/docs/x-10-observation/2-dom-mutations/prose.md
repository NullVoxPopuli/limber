# Observing DOM Mutations

The [MutationObserver API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) provides a way to watch for changes being made to the DOM tree. This is useful when you need to respond to dynamic changes in the DOM, such as elements being added or removed, attributes changing, or text content being modified.

## MutationObserver API

The MutationObserver API allows you to observe changes to the DOM tree and react to those changes:

```js
// Create a new MutationObserver
const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    // Handle the mutation
    console.log('Mutation type:', mutation.type);
    
    if (mutation.type === 'childList') {
      console.log('Nodes added:', mutation.addedNodes);
      console.log('Nodes removed:', mutation.removedNodes);
    } else if (mutation.type === 'attributes') {
      console.log('Changed attribute:', mutation.attributeName);
    } else if (mutation.type === 'characterData') {
      console.log('Text content changed');
    }
  }
});

// Start observing an element with configuration options
observer.observe(element, {
  childList: true,    // Observe direct children
  attributes: true,   // Observe attributes
  characterData: true, // Observe text content
  subtree: true       // Observe all descendants
});

// Stop observing
observer.disconnect();
```

## Using MutationObserver in Ember Components

In Ember components, you can use the MutationObserver in a modifier:

```js
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';

export default class MutationAwareComponent extends Component {
  mutationObserver = modifier((element) => {
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        this.handleMutation(mutation);
      }
    });
    
    observer.observe(element, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true
    });
    
    return () => {
      observer.disconnect();
    };
  });
  
  handleMutation(mutation) {
    // Handle the mutation
    console.log('Mutation detected:', mutation.type);
  }
  
  <template>
    <div {{this.mutationObserver}}>
      Content that might change
    </div>
  </template>
}
```

<p class="call-to-play">
  Complete the <code>DomMutations</code> component by implementing the mutation observer modifier:
  <ul>
    <li>Create a modifier that uses MutationObserver to track DOM changes</li>
    <li>Update the component state to display information about mutations</li>
    <li>Make sure to clean up the observer when the component is destroyed</li>
  </ul>
</p>

[Documentation for MutationObserver][mdn-mutation-observer]
[Documentation for Ember Modifiers][ember-modifiers]

[mdn-mutation-observer]: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
[ember-modifiers]: https://guides.emberjs.com/release/components/template-lifecycle-dom-and-modifiers/#toc_custom-modifiers
