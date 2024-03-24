export const initial = `
import * as changeCase from 'change-case';
import * as changeCase2 from '/proxy-module?m=change-case';

console.log(changeCase, changeCase2);

console.log(
  // idk
  changeCase.camelCase('foo-bar'),
  // eh?
  changeCase2.camelCase('foo-bar')
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

  let idk = await import(data.importPath);

  console.log(idk);

  if (!output) {
    throw new Error(`Where'd the output go?`);
  }

  output.textContent = data.content;
}
