Like, `each` is for iterating over lists of objects, `each-in` is for iterating over entries within an object.

```hbs
<table>
  {{#each-in planet as |property value|}}
    <tr>
      <th scope='row'>{{property}}</th>
      <td>{{value}}</td>
    </tr>
  {{/each-in}}
</table>
```

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/each-in?anchor=each-in
