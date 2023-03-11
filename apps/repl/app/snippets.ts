export const DEFAULT_SNIPPET = `# Limber Editor

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

export async function getFromLabel(label: string): Promise<string> {
  let entry = ALL.find((entry) => entry.label === label);

  if (!entry) return DEFAULT_SNIPPET;

  if ('snippet' in entry) {
    return entry.snippet;
  }

  let path = entry.path;
  let response = await fetch(path);
  let text = await response.text();

  return text;
}
