export async function createShiki() {
  const {
    createHighlighterCore,
    createJavaScriptRegexEngine,
    themeDark,
    themeOneDarkPro,
    javascript,
    typescript,
    bash,
    css,
    html,
    glimmerJS,
    glimmerTS,
    handlebars,
    jsonc,
    svelte,
    vue,
    jsx,
    mermaid,
  } = await import('./highlighter-parts.ts');
  const highlighter = await createHighlighterCore({
    themes: [themeDark, themeOneDarkPro],
    langs: [
      javascript,
      typescript,
      bash,
      css,
      html,
      glimmerJS,
      glimmerTS,
      handlebars,
      jsonc,
      svelte,
      vue,
      jsx,
      mermaid,
    ],
    engine: createJavaScriptRegexEngine(),
  });

  return highlighter;
}
