export const markdownModules = {
  'rehype-raw': () => import('rehype-raw'),
  'rehype-stringify': () => import('rehype-stringify'),
  'remark-gfm': () => import('remark-gfm'),
  'remark-parse': () => import('remark-parse'),
  'remark-rehype': () => import('remark-rehype'),
  unified: () => import('unified'),
  'unist-util-visit': () => import('unist-util-visit'),
};

export const reactModules = {
  // @ts-expect-error Does not provide its own types
  react: () => import('react'),
  // @ts-expect-error Does not provide its own types
  'react-dom': () => import('react-dom'),
  // @ts-expect-error Does not provide its own types
  '@babel/standalone': () => import('@babel/standalone'),
  process: () => import('process'),
};

export const mermaidModules = {
  mermaid: () => import('mermaid'),
};

export const svelteModules = {
  // Svelte compiler is large but needed to avoid CDN fetches in tests
  svelte: () => import('svelte'),
  'svelte/compiler': () => import('svelte/compiler'),
};

export const vueModules = {
  vue: () => import('vue'),
  '@vue/repl': () => import('@vue/repl'),
  process: () => import('process'),
};

/**
 * Tests using this shouldn't hit a CDN at all
 */
export const allKnownModules = {
  ...markdownModules,
  ...reactModules,
  ...mermaidModules,
  ...svelteModules,
  ...vueModules,
};
