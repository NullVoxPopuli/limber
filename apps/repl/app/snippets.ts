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

Hello, {{who}}!

if you're interested in a tutorial, check out
<a href="https://tutorial.glimdown.com" target="_blank">
  the interactive tutariol
</a>
`;

export const DEFAULT_SNIPPET = `# Limber Editor

**glimdown** //  _Ember or Glimmer  rendered with markdown_

<p class="hidden sm:block">
  Select demos from the menu in the header or write your own custom content and share it with others! ❤️
</p>

**NOTE:** to tab out of the editor, first press the escape key.

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
[3]: https://github.com/NullVoxPopuli/limber/issues/14`;

export const ALL = [
  { label: 'Welcome', snippet: DEFAULT_SNIPPET },
  { label: 'With inline Javascript', path: '/samples/live-js.md' },
  { label: 'With inline Templates', path: '/samples/live-hbs.md' },
  { label: 'Styleguide Demo', path: '/samples/styleguide-demo.md' },
  { label: 'Build your own REPL', path: '/samples/repl.md' },
  { label: 'Menu with focus trap', path: '/samples/menu-with-focus-trap.md' },
  { label: 'Forms', path: '/samples/forms/intro.md' },
  { label: 'RemoteData', path: '/samples/remote-data.md' },
] as const;

export const NAMES = ALL.map((demo) => demo.label);

export const LOADED = new Set([DEFAULT_SNIPPET]);

export async function getFromLabel(label: string): Promise<string> {
  const entry = ALL.find((entry) => entry.label === label);

  if (!entry) return DEFAULT_SNIPPET;

  if ('snippet' in entry) {
    return entry.snippet;
  }

  const path = entry.path;
  const response = await fetch(path);
  const text = await response.text();

  LOADED.add(text);

  return text;
}

export function defaultSnippetForFormat(format: string) {
  if (format === 'gjs') {
    return DEFAULT_GJS;
  }

  if (format === 'hbs') {
    return DEFAULT_GJS;
  }

  return DEFAULT_SNIPPET;
}
