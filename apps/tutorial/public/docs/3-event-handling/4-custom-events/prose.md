Components don't do anything special with event handling -- it all uses the built-in features of the browser.

We can use [`dispatchEvent`][mdn-dispatchEvent] with the `on` modifier to both dispatch and handle a custom event.

```js
let customEvent = new Event('my-custom-event');

someElement.dispatchEvent(customEvent);
```

The event listener for `my-custom-event` has to exist somewhere as well.
We can forward the _Element_ api upward with `...attributes`

```hbs
<button ...attributes {{on 'click' handleInnerClick}}>
  Click me
</button>
```

When creating custom Events, you can control if the event bubbles or is cancelable, [see on MDN][mdn-Event].

[mdn-dispatchEvent]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
[mdn-Event]: https://developer.mozilla.org/en-US/docs/Web/API/Event/Event
