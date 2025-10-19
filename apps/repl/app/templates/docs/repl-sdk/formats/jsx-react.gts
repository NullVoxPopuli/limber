import { H4, snippet } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

const usage = `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();

const file = \`function Demo () {
  return <>...</>;
}

export default <Demo />;
\`;

const { element, destroy } = await compiler.compile(
  'jsx',
  file,
  {
    flavor: 'react',
    /* options */
  });
`;

export const JSXReact = <template>
  <H4 @id="format-jsx-react">jsx:React</H4>

  <p>
    text here
    <snippet.js @code={{usage}} />
  </p>
</template> satisfies SimpleComponent;
