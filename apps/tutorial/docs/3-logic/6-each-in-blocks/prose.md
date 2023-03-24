Like, `each` is for iterating over lists of objects, `each-in` is for iterating over entries within an object.

```hbs
<dl>
  {{#each-in planet as |property value|}}
    <dt>{{property}}</dt>
    <dd>{{value}}</dd>
  {{/each-in}}
</dl>
```
