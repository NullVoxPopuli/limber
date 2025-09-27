import highlighted from 'limber/modifiers/highlighted';
import { ExternalLink } from 'limber-ui';

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

export const Tutorial = <template>
  <ExternalLink class="m-0" href="https://tutorial.glimdown.com/">
    The Tutorial
  </ExternalLink>
</template>;

export const issueURL = `https://github.com/NullVoxPopuli/limber/issues/new?title=[Docs]: what's goofy&body=Describe what you saw here and on what page you saw it (the URL)&labels=documentation`;

function hFor(level: string | number, text: string, id: string) {
  const h = document.createElement(`h${level}`);

  h.id = id;
  h.textContent = text;

  return h;
}

type Heading = TOC<{
  Args: {
    id: string;
    text: string;
  };
}>;

export const H2: Heading = <template>
  <a href="#{{@id}}">
    {{hFor 2 @text @id}}
  </a>
</template>;

export const H3: Heading = <template>
  <a href="#{{@id}}">
    {{hFor 3 @text @id}}
  </a>
</template>;

export const TryIt: TOC<{ Element: HTMLAnchorElement }> = <template>
  <ExternalLink ...attributes>
    try it now
  </ExternalLink>
</template>;
