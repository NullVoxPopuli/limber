import { assert } from '@ember/debug';

import highlighted from 'limber/modifiers/highlighted';

import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import type { TOC } from '@ember/component/template-only';

export const sample = '```{language} {...metadata}\n' + 'code\n' + '```';

export const example = '```gjs live\n' + '<template>\n' + '  code\n' + '</template>\n' + '```';

export const exampleMermaid =
  '```mermaid\n' +
  `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15\n` +
  '```';

export const CodeBlock: TOC<{ Args: { code: string } }> = <template>
  <div data-format="md" {{highlighted @code}}><pre><code>{{@code}}</code></pre></div>
</template>;

const JSCodeBlock: TOC<{ Args: { code: string } }> = <template>
  <div data-format="js" {{highlighted @code}}><pre><code>{{@code}}</code></pre></div>
</template>;

export const snippet = {
  js: JSCodeBlock,
} as const;

export const Tutorial = <template>
  <ExternalLink class="m-0" href="https://tutorial.glimdown.com/">
    The Tutorial
  </ExternalLink>
</template>;

export const issueURL = `https://github.com/NullVoxPopuli/limber/issues/new?title=[Docs]: what's goofy&body=Describe what you saw here and on what page you saw it (the URL)&labels=documentation`;

function hFor(level: string | number, text: string | undefined, id: string) {
  const h = document.createElement(`h${level}`);

  h.id = id;

  if (text) {
    h.textContent = text;
  }

  return h;
}

function getH(level: string | number, id: string) {
  const selector = `h${level}#${id}`;
  const el = document.querySelector(selector);

  assert(`Could not find element with selector: '${selector}'`, el);

  return el;
}

type Heading = TOC<{
  Element: HTMLAnchorElement;
  Args: {
    id: string;
    text?: string;
  };
  Blocks: {
    default?: [];
  };
}>;

export const H2: Heading = <template>
  <a href="#{{@id}}" ...attributes>
    {{hFor 2 @text @id}}
    {{#if (has-block)}}
      {{#in-element (getH 2 @id)}}
        {{yield}}
      {{/in-element}}
    {{/if}}
  </a>
</template>;

export const H3: Heading = <template>
  <a href="#{{@id}}" ...attributes>
    {{hFor 3 @text @id}}
    {{#if (has-block)}}
      {{#in-element (getH 3 @id)}}
        {{yield}}
      {{/in-element}}
    {{/if}}
  </a>
</template>;

export const H4: Heading = <template>
  <a href="#{{@id}}" ...attributes>
    {{hFor 4 @text @id}}
    {{#if (has-block)}}
      {{#in-element (getH 4 @id)}}
        {{yield}}
      {{/in-element}}
    {{/if}}
  </a>
</template>;

export const TryIt: TOC<{ Element: HTMLAnchorElement }> = <template>
  <ExternalLink ...attributes>
    try it now
  </ExternalLink>
</template>;
