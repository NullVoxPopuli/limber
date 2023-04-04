All functions available on [`globalThis`][mdn-globalThis] ([window][mdn-Window] in browsers), are available to use in templates.

For example, retrieving data from [`localStorage`][mdn-LocalStorage] may be done like this:
```hbs 
{{localStorage.getItem "the-key"}}
```

And likewise, if we have data we need to format with [`JSON.stringify`][mdn-json-stringify], that would look like:
```hbs 
<pre><code>{{JSON.stringify data null "\t"}}</code></pre>
```

The same [polish][polish] notation we used early applies to all globally available functions -- so the above `stringify` call would like like this, if in JS: `JSON.stringify(data, null, "\t")`

Note that due to how polish notation reads, it's _highly encouraged_ to extract one-off utility functions instead of wrapping more functions in the template.

For example:
```gjs 
function formatFromStorage(key) {
  let stored = localStorage.getItem(key);
  let parsed = stored ? JSON.parse(stored) : {};
  
  return JSON.stringify(parsed, null, '\t');
}

<template>
  <pre><code>{{formatFromStorage "the-key"}}</code></pre>
</template>
```

Since templates are the _source of truth_ for what is visible to users, it's useful to make them as readable as possible. An extra advantage here is that the extracted functions can more easily be unit tested.


[mdn-globalThis]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
[mdn-Window]: https://developer.mozilla.org/en-US/docs/Web/API/Window
[mdn-LocalStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[mdn-json-stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[polish]: https://en.wikipedia.org/wiki/Polish_notation
