Looping over lists of data can be done with an `each` block:

```hbs
<ul>
  {{#each planets as |planet|}}
    <li>
      <a href='https://swapi.dev/api/planets/{{planet.id}}/' target='_blank'>
        {{planet.name}}
      </a>
    </li>
  {{/each}}
</ul>
```

You can get the current index as a second argument as well:

```hbs
<ul>
  {{#each planets as |planet i|}}
    <li>
      <a href='https://swapi.dev/api/planets/{{planet.id}}/' target='_blank'>
        {{i}}
        {{planet.name}}
      </a>
    </li>
  {{/each}}
</ul>
```

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/each?anchor=each
