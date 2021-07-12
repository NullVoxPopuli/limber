export const DEFAULT_SNIPPET = `
# Limber Editor

**glimdown** //  _Ember or Glimmer  rendered with markdown_

<p class="hidden sm:block">
  Select demos from the menu in the header or write your own custom content and share it with others! ❤️
</p>

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

[1]: https://github.com/glimmerjs/glimmer-experimental/tree/master/packages/examples/playground
[2]: https://github.com/ember-template-imports/ember-template-imports
[3]: https://github.com/NullVoxPopuli/limber/issues/14
`.trim();

export const WITH_LIVE_JS = `
# Limber Editor

## With JavaScript

code fence tags can be used to directly render components,
as well as render the code snippet the live code comes from.

Options:

 - \`live\` - _renders in place_
 - \`live preview\` _renders in place, placing the source after the live render_
 - \`live preview below\` _renders in place, placing the live render below the source_

\`\`\`gjs live
<template>
  Hello, Glimmer!
</template>
\`\`\`

\`\`\`gjs live preview
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';

export default class HelloWorld extends Component {
  @tracked count = 1;

  increment = (amount) => this.count += amount;

  <template>
    <p>You have clicked the button {{this.count}} times.</p>

    <button {{on "click" (fn this.increment 1)}}>Click</button>
  </template>
}
\`\`\`
`.trim();

export const WITH_LIVE_HBS = `
# Limber Editor

## With JavaScript

code fence tags can be used to directly render components,
as well as render the code snippet the live code comes from.

Options:

 - \`live\` - _renders in place_
 - \`live preview\` _renders in place, placing the source after the live render_
 - \`live preview below\` _renders in place, placing the live render below the source_

\`\`\`hbs live
{{#if true}}
  Hello There!
{{/if}}
\`\`\`

\`\`\`hbs live preview
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
\`\`\`
`.trim();

export const EXAMPLE_STYLEGUIDE_DEMO = `
# Use with your styleguide

In Ember's strict mode, components must be imported in order
to be rendered. The default resolver, which has everything available
in the global namespace, is not used.

For more information on template-strict-mode, view
[RFC#496](https://github.com/emberjs/rfcs/pull/496)

\`\`\`gjs  live preview
import ExternalLink from 'limber/components/external-link';

<template>
  <ExternalLink href="#">Link</ExternalLink>
  <ExternalLink href="https://emberjs.com">Ember.JS' Site</ExternalLink>
</template>
  \`\`\`
`.trim();

export const ALL = [
  { label: 'Welcome', snippet: DEFAULT_SNIPPET },
  { label: 'With inline Javascript', snippet: WITH_LIVE_JS },
  { label: 'With inline Templates', snippet: WITH_LIVE_HBS },
  { label: 'Styleguide Demo', snippet: EXAMPLE_STYLEGUIDE_DEMO },
];

export const NAMES = ALL.map((demo) => demo.label);

export const BY_NAME = ALL.reduce((obj, current) => {
  obj[current.label] = current.snippet;

  return obj;
}, {} as Record<string, string>);
