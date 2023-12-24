Vanilla JavaScript has everything we need to handle form data, de-sync it from our source data and collect all user input upon submission.

In the form below, we create a Vanilla™ [HTML form][2], and only add "Ember" code for handling the form submission and field inputs once on the `<form>` tag. By default, form submissions will cause a page reload, so in a single-page-app, we need to prevent that default behavior.

Using the native API, [FormData][1], we can gather the user inputs when the user presses the submit button.

```hbs
<form {{on 'input' handleInput}} {{on 'submit' handleSubmit}}>
  <label>
    First Name
    <input name='firstName' />
  </label>

  <!-- any amount of form fields may be present here, it's *just HTML* -->

  <button type='submit'>Submit</button>
</form>
```

In this chapter, add the necessary `on` event listeners so that the form automatically behaves reactively.

Like with the [URL][4], [localStorage][5], and other web-platform-primitives, the storage machanism is _string-based_. For non-string data, the form will need to be converted to a string during render and converted back on submission.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[2]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
[3]: https://guides.emberjs.com/release/components/component-state-and-actions/#toc_html-modifiers-and-actions
[4]: https://developer.mozilla.org/en-US/docs/Web/API/URL
[5]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
