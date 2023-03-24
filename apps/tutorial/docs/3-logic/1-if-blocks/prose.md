HTML lacks the ability to express logic, like conditionals, loops, etc.

To render markup conditionally, it involves wrapping it in an if block:

```hbs
{{#if loggedIn}}
  <button {{on 'click' toggle}}>
    Log out
  </button>

{{/if}}

{{#if (notLoggedIn)}}
  <button>
    Log in
  </button>
{{/if}}
```

Try updating the example so that the buttons are conditionally shown based on the `loggedIn` boolean.

------------

Note that the syntax for "control flow" is a _pair_ of `{{ ... }}` with the opening `{{ }}` starting with a `#` and the closing `{{ }}` starting with a `/`. This is called "block syntax".
