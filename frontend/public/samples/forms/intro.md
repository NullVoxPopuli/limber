# Forms

### Using _The Platform_

Vanilla JavaScript has everything we need to handle form data, de-sync it from our source data and collect all user input upon submission.

Other abstractions, such as the "changeset" concept contain a lot of this functionality and have additional utilities such as rollback, snapshots, forking, etc, but that is a topic for another demo.

In the form below, we create a Vanilla™ [HTML form][2], and only add "Ember" code for handling the form submission. By default, form submissions will cause a page reload, so in a single-page-app, we need to prevent that default behavior.

Using the native API, [FormData][1], we can gather the user inputs when the user presses the submit button.

```gjs live
import { on } from '@ember/modifier';

const handleSubmit = (event) => {
  event.preventDefault();

  let formData = new FormData(event.target);
  let data = Object.fromEntries(formData.entries());

  alert(JSON.stringify(data, null, 2));
};

<template>
  <form {{on 'submit' handleSubmit}} class="grid gap-2" style="max-width: 300px">
    <label> First Name
      <input name='firstName'>
    </label>

    <label> Favorite Date
      <input type='date' name='favoriteDate'>
    </label>

    <button type='submit'>Submit</button>
  </form>

  <style>
    input { border: 1px solid; }
  </style>
</template>
```

<hr>

### "Platform" References
 - [`<form>` on MDN][2]
 - [`FormData` on MDN][1]

### Ember References
 - [the `on` modifier][3]


[1]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[2]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
[3]: https://guides.emberjs.com/release/components/component-state-and-actions/#toc_html-modifiers-and-actions
