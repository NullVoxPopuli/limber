import { H3, snippet } from '../../support/code.gts';

import type { SimpleComponent } from '#types';

const usage = `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();

const file = \`<!doctype html>
<style>
  h1 { color: rebeccapurple; }
</style>

<h1>Hello</h1>

<script type="module">
  document.querySelector('h1').textContent += ', world';
</script>
\`;

const { element, destroy } = await compiler.compile(
  'html',
  file,
  { /* options */ });
`;

export const HTML = <template>
  <H3 @id="format-html">html</H3>

  <p>
    The HTML renderer puts the whole document in an
    <code>&lt;iframe srcdoc&gt;</code>. The document can have a
    <code>&lt;head&gt;</code>,
    <code>&lt;style&gt;</code>
    tags, classic scripts,
    <code>&lt;script type="module"&gt;</code>, and an import map. Styles do not leak in to or out of
    the frame. The frame is as tall as its content. The frame gets the color scheme of the host
    page, so
    <code>light-dark()</code>
    follows the light or dark mode of the host. A page with its own
    <code>color-scheme</code>
    keeps it.

    <snippet.js @code={{usage}} />
  </p>
</template> satisfies SimpleComponent;
