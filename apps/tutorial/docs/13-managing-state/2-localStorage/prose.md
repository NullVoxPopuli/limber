[`localStorage`][mdn-localStorage] is a way to store string-based data outside your application so that it may be accessed later. This data will persist between refreshes, so it could be useful for restoring user data when they navigate away from your app and come back later.

To use `localStorage`, and maintain reactivity, you'll need to manage a local reactive value, as well as utilize the `localStorage` APIs.

```js
class Demo extends Component {
  @tracked _count = 0;

  get count() {
    let fromStorage = parseInt(localStorage.getItem('count')) ?? 0;
    return this._count || fromStorage;
  }
  set count(value) {
    localStorage.setItem('count', value ?? 0);
    this._count = value;
  }
}
```

This technique uses the native [get][mdn-get] and [set][mdn-set] behaviors of JavaScript, allowing you to (in a way), intercept how `_count` gets read and set. This is similar to how `@tracked` works under the hood with the reactive value primitives.

This tutorial does not (yet) store your in-progress work, so go-ahead and click the "show me" button below, click the button in the output pane a few times, and refresh the page.

[mdn-localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[mdn-get]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
[mdn-set]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set
