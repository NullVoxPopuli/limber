# Observing Window Resize

Modern web applications often need to respond to changes in the window size to create responsive layouts and adapt the user interface. The browser provides events and APIs to detect and respond to window resize events.

## Window Resize Event

The simplest way to observe window resize is by using the `resize` event on the `window` object:

```js
// Add an event listener for window resize
window.addEventListener('resize', () => {
  // Handle the resize event
  console.log('Window resized!');
  console.log('New dimensions:', window.innerWidth, 'x', window.innerHeight);
});

// Remove the event listener when no longer needed
window.removeEventListener('resize', handleResize);
```

## Debouncing Resize Events

Since resize events can fire rapidly during a resize operation, it's often a good practice to debounce the handler to avoid performance issues:

```js
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

const handleResize = debounce(() => {
  console.log('Window resized!');
  console.log('New dimensions:', window.innerWidth, 'x', window.innerHeight);
}, 250); // Wait 250ms after the last resize event

window.addEventListener('resize', handleResize);
```

## Using Window Resize in Ember Components

In Ember components, you can use the `resize` event in a modifier:

```js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';

export default class ResizeAwareComponent extends Component {
  @tracked windowWidth = window.innerWidth;
  @tracked windowHeight = window.innerHeight;
  
  windowResize = modifier(() => {
    const handleResize = () => {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  
  <template>
    <div {{this.windowResize}}>
      Window size: {{this.windowWidth}} x {{this.windowHeight}}
    </div>
  </template>
}
```

<p class="call-to-play">
  Complete the <code>WindowResize</code> component by implementing the window resize observer:
  <ul>
    <li>Create a modifier that uses the window resize event to track window dimensions</li>
    <li>Implement debouncing to avoid performance issues during rapid resize events</li>
    <li>Update the component state with the current window dimensions</li>
    <li>Make sure to clean up the event listener when the component is destroyed</li>
  </ul>
</p>

[Documentation for Window resize event][mdn-resize-event]
[Documentation for Ember Modifiers][ember-modifiers]
[Documentation for Debouncing][debouncing]

[mdn-resize-event]: https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
[ember-modifiers]: https://guides.emberjs.com/release/components/template-lifecycle-dom-and-modifiers/#toc_custom-modifiers
[debouncing]: https://css-tricks.com/debouncing-throttling-explained-examples/
