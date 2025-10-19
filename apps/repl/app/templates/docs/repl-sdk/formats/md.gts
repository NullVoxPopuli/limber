import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import { H3, snippet } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

const usage = `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();

const file = \`# Welcome

content

\`\`\`js
higlhighted code fence
\`\`\`

\`\`\`gjs live
rendered code fence
\`\`\`

\`;

const { element, destroy } = await compiler.compile(
  'md',
  file,
  { /* options */ });
`;

export const MD = <template>
  <H3 @id="format-md">md</H3>

  <p>
    This markdown implementation is configured with
    <ExternalLink
      href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
    >GitHub-flavored Markdown</ExternalLink>. It uses
    <ExternalLink href="https://remark.js.org/">Remark</ExternalLink>
    for parsing markdown, and
    <ExternalLink href="https://github.com/rehypejs/rehype">Rehype</ExternalLink>
    for converting to HTML for actual rendering. Both remark and rehype plugins are supported and
    configurable.
    <br />
    <br />Every supported format by the compiler can be rendered via codefence.

    <snippet.js @code={{usage}} />
  </p>
</template> satisfies SimpleComponent;
