Since the two conditions — `if user.loggedIn` and `if (notLoggedIn)` — are mutually exclusive, we can simplify this component slightly by using an else block:

```hbs
{{#if user.loggedIn}}
  <button {{on 'click' toggle}}>
    Log out
  </button>
{{else}}
  <button {{on 'click' toggle}}>
    Log in
  </button>
{{/if}}
```

Note that `{{else}}` is an inconsistency in the syntax. Normally `{{identifier}}` would render a value to the DOM, but in this case, `{{else}}` is a special key word that is only valid within `if` and `unless` blocks.

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/if?anchor=if
