import { snippetCompletion as snip } from '@codemirror/autocomplete';

import type { Completion } from '@codemirror/autocomplete';

/// A collection of JavaScript-related
/// [snippets](#autocomplete.snippet).
export const snippets: readonly Completion[] = [
  snip('#each ${list} as |${item}|}}\n\t${}\n{{/each', {
    label: '#each',
    detail: 'loop',
    type: 'keyword',
  }),
  snip('#each-in ${object} as |${key} ${value}|}}\n\t${}\n{{/each-in', {
    label: '#each-in',
    detail: 'loop',
    type: 'keyword',
  }),
  snip('#let ${subExpression} as |${result}|}}\n\t${}\n{{/let', {
    label: '#let',
    detail: 'block',
    type: 'keyword',
  }),
  snip('#if ${condition}}}\n\t${}\n{{/if', {
    label: '#if',
    detail: 'block',
    type: 'keyword',
  }),
  snip('#in-element ${element}}}\n\t${}\n{{/in-element', {
    label: '#in-element',
    detail: 'block',
    type: 'keyword',
  }),
  snip('#unless ${condition}}}\n\t${}\n{{/unless', {
    label: '#unless',
    detail: 'block',
    type: 'keyword',
  }),
  snip('#if ${condition}}}\n\t${}\n{{else}}\n\t${}\n{{/if', {
    label: '#if',
    detail: '/ else block',
    type: 'keyword',
  }),
  snip('#unless ${condition}}}\n\t${}\n{{else}}\n\t${}\n{{/unless', {
    label: '#unless',
    detail: '/ else block',
    type: 'keyword',
  }),
];
