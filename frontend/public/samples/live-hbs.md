# Limber Editor

## With JavaScript

code fence tags can be used to directly render components,
as well as render the code snippet the live code comes from.

Options:

 - `live` - _renders in place_
 - `live preview` _renders in place, placing the source after the live render_
 - `live preview below` _renders in place, placing the live render below the source_

```hbs live
{{#if true}}
  Hello There!
{{/if}}
```

```hbs live preview
List of links:
<ul>
  {{#each (array
    (hash href='https://emberjs.com' text='Ember home page')
    (hash href='https://github.com/nullvoxpopuli' text='My GitHub')
    (hash href='https://twitter.com/nullvoxpopuli' text='My Twitter')
  ) as |site|}}
    <li>
      <a href={{site.href}} target="_blank">{{site.text}}</a>
    </li>
  {{/each}}
</ul>
```
