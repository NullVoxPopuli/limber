import { assert } from '@ember/debug';

export const DEFAULT_GJS = `// Welcome!

const who = 'world';

<template>
  Hello, {{who}}!

  for a tutorial on this format, check out
  <a href="https://tutorial.glimdown.com" target="_blank">
    the interactive tutariol
  </a>
</template>
`;
export const DEFAULT_HBS = `{{! Welcome! }}

Hello, world!

if you're interested in a tutorial, check out
<a href="https://tutorial.glimdown.com" target="_blank">
  the interactive tutariol
</a>
`;

export const DEFAULT_SNIPPET = `# Welcome!

<p class="hidden sm:block">
  Select demos from the menu in the header or write your own custom content and share it with others! ❤️
</p>

**NOTE:** to tab out of the editor, first press the escape key.

This REPL supports the following:

| Demo | Docs |
| -------------- | ----------- |
| [Svelte][svelte-demo] | [svelte.dev][docs-svelte] ↗
| [Vue][vue-demo] | [vuejs.org][docs-vue] ↗
| React ([jsx][jsx-react-demo]) | [react.dev][docs-react] ↗
| Ember ([gjs][gjs-ember-demo], [hbs][hbs-ember-demo]) | [emberjs.com][docs-ember] ↗
| [Mermaid][mermaid-demo] | [mermaid.js.org][docs-mermaid] ↗
| [Markdown][md-demo] with live islands | [@ GitHub][docs-markdown] ↗
| [Glimdown][gmd-demo] (this doc) |

**glimdown** //  _Ember or Glimmer rendered with markdown_

<hr>

[svelte-demo]: /?format=svelte&file=/samples/svelte-demo.svelte
[vue-demo]: /?format=vue&file=/samples/vue-demo.vue
[jsx-react-demo]: /?format=jsx|react&file=/samples/jsx-react-demo.jsx&shadowdom=false
[gjs-ember-demo]: /?format=gjs&file=/samples/gjs-demo.gjs
[hbs-ember-demo]: /?format=hbs|ember&file=/samples/hbs-demo.hbs
[mermaid-demo]: /?format=mermaid&file=/samples/mermaid-demo.mermaid
[md-demo]: /?format=md&file=/samples/all.md
[gmd-demo]: /

[docs-svelte]: https://svelte.dev/
[docs-vue]: https://vuejs.org/
[docs-react]: https://react.dev/
[docs-ember]: https://emberjs.com/
[docs-mermaid]: https://mermaid.js.org/
[docs-markdown]: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax

## Glimdown

Some globally available (predefined) functions can be invoked in glimdown, for example, using \`array\` and \`hash\`:

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

This list is user-configurable via:
\`\`\`js
import { setupCompiler } from 'ember-repl';

// ...

setupCompiler(this, {
  options: {
    gmd: {
      scope: {
        // your scope additions here
      },
    },
  },
);
\`\`\`

[1]: https://github.com/glimmerjs/glimmer-experimental/tree/master/packages/examples/playground
[2]: https://github.com/ember-template-imports/ember-template-imports
[3]: https://github.com/NullVoxPopuli/limber/issues/14

`;

/**
 * NOTE: label must be unique
 */
export const ALL = [
  { format: 'gmd', label: 'Welcome', snippet: DEFAULT_SNIPPET },
  { format: 'md', label: 'All Frameworks in Markdown', path: '/samples/all.md' },
  { format: 'gjs', label: 'Ember GJS', path: '/samples/gjs-demo.gjs' },
  { format: 'svelte', label: 'Svelte', path: '/samples/svelte-demo.svelte' },
  { format: 'js', label: 'Vanilla JS', path: '/samples/js-demo.js' },
  // Yaml
  { format: 'mermaid', label: 'Mermaid', path: '/samples/mermaid-demo.mermaid' },
  { format: 'vue', label: 'Vue', path: '/samples/vue-demo.vue' },
  {
    format: 'jsx|react',
    label: 'React JSX',
    path: '/samples/jsx-react-demo.jsx',
    qps: { shadowdom: '0' },
  },
  { format: 'hbs', label: 'Ember HBS', path: '/samples/hbs-demo.hbs' },
  { format: 'md', label: 'With inline Javascript', path: '/samples/live-js.md' },
  { format: 'gmd', label: 'With inline Templates', path: '/samples/live-hbs.md' },
  {
    format: 'md',
    label: 'Styleguide Demo',
    path: '/samples/styleguide-demo.md',
    qps: { shadowdom: '0' },
  },
  { format: 'md', label: 'Build your own REPL', path: '/samples/repl.md' },
  {
    format: 'md',
    label: 'Menu with focus trap',
    path: '/samples/menu-with-focus-trap.md',
    qps: { shadowdom: '0' },
  },
  { format: 'md', label: 'Forms', path: '/samples/forms/intro.md' },
  { format: 'md', label: 'RemoteData', path: '/samples/remote-data.md' },
] as const;

export type DemoEntry = (typeof ALL)[number];

export const NAMES = ALL.map((demo) => demo.label);

assert(
  `Expected every label of the list of Demo snippets to be unique`,
  new Set(NAMES).size === ALL.length
);

export const LOADED = new Set([DEFAULT_SNIPPET]);

export async function getFromLabel(label: string): Promise<string> {
  const entry = ALL.find((entry) => entry.label === label);

  if (!entry) return DEFAULT_SNIPPET;

  if ('snippet' in entry && typeof entry.snippet === 'string') {
    return entry.snippet;
  }

  if ('path' in entry) {
    const path = entry.path;
    const response = await fetch(path);
    const text = await response.text();

    LOADED.add(text);

    return text;
  }

  throw new Error(`Unhandled snippet control flow. Please open an issue`);
}

export function defaultSnippetForFormat(format: string) {
  if (format === 'gjs') {
    return DEFAULT_GJS;
  }

  if (format === 'hbs') {
    return DEFAULT_HBS;
  }

  return DEFAULT_SNIPPET;
}
