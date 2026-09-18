/**
 * Shiki for the tutorial, with the grammars of the languages that its prose shows.
 * The imports are dynamic, so the first page does not wait for the grammars.
 */
export async function createShiki() {
  const [
    { createHighlighterCore },
    { createJavaScriptRegexEngine },
    themeDark,
    themeOneDarkPro,
    ...langs
  ] = await Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
    import('shiki/themes/github-dark.mjs'),
    import('shiki/themes/one-dark-pro.mjs'),
    import('shiki/langs/javascript.mjs'),
    import('shiki/langs/typescript.mjs'),
    import('shiki/langs/bash.mjs'),
    import('shiki/langs/css.mjs'),
    import('shiki/langs/html.mjs'),
    import('shiki/langs/glimmer-js.mjs'),
    import('shiki/langs/glimmer-ts.mjs'),
    import('shiki/langs/handlebars.mjs'),
    import('shiki/langs/jsonc.mjs'),
    import('shiki/langs/svelte.mjs'),
    import('shiki/langs/vue.mjs'),
    import('shiki/langs/jsx.mjs'),
    import('shiki/langs/mermaid.mjs'),
  ]);

  return createHighlighterCore({
    themes: [themeDark.default, themeOneDarkPro.default],
    langs: langs.map((lang) => lang.default),
    engine: createJavaScriptRegexEngine(),
  });
}
