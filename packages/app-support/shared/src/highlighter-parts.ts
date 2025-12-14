/**
 * A Custom Shiki Bundle
 */

// Engine
export { createHighlighterCore } from 'shiki/core';
export { createOnigurumaEngine } from 'shiki/engine/oniguruma';
export * as wasm from 'shiki/wasm';

// Themes
export * as themeDark from 'shiki/themes/github-dark.mjs';
export * as themeOneDarkPro from 'shiki/themes/one-dark-pro.mjs';

// Languages
export * as bash from 'shiki/langs/bash.mjs';
export * as css from 'shiki/langs/css.mjs';
export * as glimmerJS from 'shiki/langs/glimmer-js.mjs';
export * as glimmerTS from 'shiki/langs/glimmer-ts.mjs';
export * as handlebars from 'shiki/langs/handlebars.mjs';
export * as html from 'shiki/langs/html.mjs';
export * as javascript from 'shiki/langs/javascript.mjs';
export * as jsonc from 'shiki/langs/jsonc.mjs';
export * as jsx from 'shiki/langs/jsx.mjs';
export * as markdown from 'shiki/langs/markdown.mjs';
export * as mermaid from 'shiki/langs/mermaid.mjs';
export * as svelte from 'shiki/langs/svelte.mjs';
export * as typescript from 'shiki/langs/typescript.mjs';
export * as vue from 'shiki/langs/vue.mjs';
