export const initial = `
import * as changeCase from 'change-case';
import { Preprocessor } from 'content-tag';

const p = new Preprocessor();

console.log(p.process(\`
  <template>
    hello there
  </template>
\`));

console.log(
  changeCase.camelCase('foo-bar'),
);
`;

const entry = document.querySelector('#entry');
const output = document.querySelector('#output');

if (!entry || !(entry instanceof HTMLTextAreaElement)) {
  throw new Error(`Where'd the textarea go?`);
}
if (!output) {
  throw new Error(`Where'd the output go?`);
}

entry.value = initial;

entry.addEventListener('input', (event) => {
  if (!(event.target instanceof HTMLTextAreaElement)) {
    console.error(event);
    throw new Error(`Wrong event?`);
  }

  compile(event.target.value);
});

/**
 * @param {string} code
 */
export async function compile(code) {
  let response = await fetch(`/compile.sw`, {
    method: 'POST',
    body: JSON.stringify({ code, format: 'js' }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  let data = await response.json();

  // Eval, but with extra steps
  await import(/* @vite-ignore */ /* webpack-ignore */ data.importPath);

  console.group('Code');
  console.log(data.content);
  console.groupEnd();

  if (!output) {
    throw new Error(`Where'd the output go?`);
  }

  output.textContent = data.content;
}
