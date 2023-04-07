As good as writing plain HTML is, it cannot as easily know what we want initial values in our form to be.

For that, we still need to utilize the [`value`][3] attribute.

```hbs
<input name='firstName' value={{initialData.firstName}} />
```

[3]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#value
