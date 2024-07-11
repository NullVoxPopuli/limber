// app/routes/application.ts
import Route from "@ember/routing/route";

import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { setupKolay } from "kolay/setup";
import { createHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";

import type { Manifest } from "kolay";

export default class ApplicationRoute extends Route {
  async model(): Promise<{ manifest: Manifest }> {
    const highlighter = await createHighlighterCore({
      themes: [import("shiki/themes/github-dark.mjs"), import("shiki/themes/github-light.mjs")],
      langs: [
        import("shiki/langs/javascript.mjs"),
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/bash.mjs"),
        import("shiki/langs/css.mjs"),
        import("shiki/langs/html.mjs"),
        import("shiki/langs/glimmer-js.mjs"),
        import("shiki/langs/glimmer-ts.mjs"),
        import("shiki/langs/handlebars.mjs"),
        import("shiki/langs/jsonc.mjs"),
      ],
      loadWasm: getWasm,
    });

    const manifest = await setupKolay(this, {
      resolve: {
        "ember-primitives": import("ember-primitives"),
        kolay: import("kolay"),
      },
      rehypePlugins: [
        [
          rehypeShikiFromHighlighter,
          highlighter,
          {
            themes: {
              light: "github-light",
              dark: "github-dark",
            },
          },
        ],
      ],
    });

    return { manifest };
  }
}
