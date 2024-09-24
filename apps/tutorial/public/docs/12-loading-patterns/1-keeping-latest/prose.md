The `keepLatest` utility resource allows you to hang on to a stable reference to data while new data loads.

This can be useful for improving user experience across sites with data that takes some time to fetch or just paginated data in general.

_Typically, users don't want to see the UI flashing a bunch of different states_.
The more stable we can keep the UI, and defer to subtle / polite indicators of progress, the better. We are kinder to the visual stimulous we put our users through.

`keepLatest` _only_ works in a class for now, but it looks like this:

```js
class Demo extends Component {
  @use request = RemoteData(() => urlFor(this.id));
  @use latest = keepLatest({
    value: () => this.request.value,
    when: () => this.request.isLoading,
  });

  // ...
}
```

And this is read as "Keep the latest `value` from changing `when` `this.request.isLoading`.
During an initial request `latest` will be null, and for all subsequent requests, it'll be whatever the the value of `request`'s most recent successful value was.

In this exercise, wire up the `keepLatest` utility so that when the `id` changes, triggering `RemoteData` to make a new request, the async loading state is subtle.
