Like with the [URL][1], [localStorage][2], and other web-platform-primitives,
the storage machanism for `<form>`s is _string-based_.

For non-string data, the form will need to be converted to a string during render and converted back on submission.

If we want to use a number field, and ensure the data we receive back from the form is a number,
we must adjust the `handleInput` function from before.

```js
function parse(data) {
  let result = { ...data };

  if ('numberField' in data) {
    result.numberField = parseInt(data.numberField, 10);
  }

  return result;
}

const handleInput = (event) {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());

  let parsed = parse(data);

  // ...
}
```

Adjust the example so that the number `input` field parses to a number when edited or the form is submitted.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/URL
[2]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[3]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#value
