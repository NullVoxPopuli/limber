By default, when you modify an entry in a list looped over by an `each` block, object-identity equality will be used to optimize the loop. Much like how reactive-values are only reactive via the _reference_ to their value, the content of an `each` loop, per-item, is cached on the reference to the item in the list.

This behavior can be modified, like if a list of data does not contain stable object references.

We can choose a property to watch for changes:
```hbs
<ul>
  {{#each planets key="id" as |planet|}}
    <li>{{planet.name}}</li> 
  {{/each}}
</ul>
```

We can observe how the list updates the DOM by seeing how function invocations occur within the `each` loop.
