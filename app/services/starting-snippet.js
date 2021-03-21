export const DEFAULT_SNIPPET = `
# Limber Editor

_Ember rendered with markdown_

Similar to MDX!

## Template only content

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

## With JavaScript

TBD (need to add babel to the browser bundle)

## TODOs

- dynamically load template, babel, and markdown compilers
- dynamically load code editor
`.trim();
