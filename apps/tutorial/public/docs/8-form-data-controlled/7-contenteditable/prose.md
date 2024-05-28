Because contenteditable has browser-implemented internal state, it's not *exactly* able to be controlled. But we can set the initial value, and listen to updates as they happen.


For setting the initial value we need to _disconnect_ from auto-tracking.
This can be done, inline, with an async immediately invoked function execution (IIFE), 
```js
(async () => {
  await Promise.resolve();
  // code that access tracked state here
  // ...
})()
```
This defers execution of "the real code" to the "next" [microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth).
We also need to get a reference to the element, so we'll need to create a modifier for where our async IIFE can live:
```js
import { modifier } from 'ember-modifier';

const setContent = modifier((element, [initialize]) => {
  (async () => {
    // Disconnect from auto-tracking
    // so we can only set the inner HTML once
    await Promise.resolve();
    initialize(element);
  })();
});
```
But then we need to use the modifier in our contenteditable:
```gjs
class Demo extends Component {
  setValue = (element) => element.innerHTML = this.args.value;

  <template>
    <div 
      contenteditable="true"
      {{setContent this.setValue}}
    ></div>
  </template>
}
```

And for the event binding, we can use the `input` event to have live updates as we type:
```gjs
class Demo extends Component {
  handleChange = (event) => {
    let textarea = event.target;

    this.args.onChange(textarea.innerHTML);
  }

  <template>
    <div 
      contenteditable="true"
      {{setContent this.setValue}}
      {{on 'input' this.handleChange}}
    ></div>
  </template>
}
```

Unlike the other controlled inputs we've covered so far, we dan't expect to do anything with the updated `@value` once it's passed back in to our `contenteditable` component. `contenteditable` has its own state, and if we were to retain an fully _controlled_ `@value`, we would then need to manage the cursor position within the contenteditable element, and that is a lot of code. 

<p class="call-to-play">
  Change the contenteditable within the <code>ControlledInput</code> component 
  to <strong>have an initial value set and an input event listener</strong>.
</p>


