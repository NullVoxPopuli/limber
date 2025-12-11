import { H3, snippet } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

const usage = `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();

const file = \`export default function render(element) {
  // render logic here
}
\`;

const { element, destroy } = await compiler.compile(
  'hbs',
  file,
  {
    flavor: 'ember',
    /* options */
  });
`;

export const JS = <template>
  <H3 @id="format-js">js</H3>

  <p>
    This vanilla JavaScript renderer is simple in that it does nothing special
    and leaves all the rendering to the author of the input file. A function
    must be
    <code>export default</code>ed, and it will recieve the
    <code>element</code>
    to render in to.

    <snippet.js @code={{usage}} />
  </p>
</template> satisfies SimpleComponent;
