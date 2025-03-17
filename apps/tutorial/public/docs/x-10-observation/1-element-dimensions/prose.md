# Observing Element Dimensions

Modern web applications often need to respond to changes in element dimensions. The platform provides the [ResizeObserver API](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) for this purpose, allowing you to observe changes to an element's size.

## ResizeObserver API

The ResizeObserver API provides a way to observe changes to the dimensions of an Element's content or border box, or the bounding box of an SVGElement.

```js
// Create a new ResizeObserver
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    // Handle resize
    console.log('Element resized:', entry.contentRect);
  }
});

// Start observing an element
resizeObserver.observe(element);

// Stop observing
resizeObserver.unobserve(element);

// Disconnect (stop observing all elements)
resizeObserver.disconnect();
```

## Using ResizeObserver in Ember Components

In Ember components, you can use the ResizeObserver in the `didInsertElement` lifecycle hook for classic components or in a modifier for Glimmer components:

```js
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';

export default class ResizeAwareComponent extends Component {
  resizeObserver = modifier((element) => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.handleResize(entry);
      }
    });
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  });
  
  handleResize(entry) {
    // Handle the resize event
    const { width, height } = entry.contentRect;
    console.log(`Element size: ${width} x ${height}`);
  }
  
  <template>
    <div {{this.resizeObserver}}>
      Resize me!
    </div>
  </template>
}
```

<p class="call-to-play">
  Complete the <code>ElementDimensions</code> component by implementing the resize observer modifier:
  <ul>
    <li>Create a modifier that uses ResizeObserver to track element dimensions</li>
    <li>Update the component state with the current dimensions</li>
    <li>Make sure to clean up the observer when the component is destroyed</li>
  </ul>
</p>

[Documentation for ResizeObserver][mdn-resize-observer]
[Documentation for Ember Modifiers][ember-modifiers]

[mdn-resize-observer]: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
[ember-modifiers]: https://guides.emberjs.com/release/components/template-lifecycle-dom-and-modifiers/#toc_custom-modifiers
