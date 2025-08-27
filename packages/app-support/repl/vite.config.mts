import { resolve, join } from "node:path";
import { readFile } from "node:fs/promises";
import url from "node:url";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import * as emberRepl from "ember-repl/externals";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

let manifest = await (async () => {
  let buffer = await readFile(join(__dirname, "package.json"));
  return JSON.parse(buffer.toString());
})();

let externals = [
  ...Object.keys({
    ...(manifest.dependencies || {}),
    ...(manifest.peerDependencies || {}),
  }),
  // from ember-repl
  //
  // we can't bundle these (and don't want to), because
  // the host app provides these modules, so these are "peers".
  // specifically "virtual peers" since they are provided by ember-source and the `ember()` plugin from @embroider/vite
  ...emberRepl.externals,
].filter((x) => {
  return !x.includes("codemirror");
});

const markdownDeps = [
  "parse5",
  "unified",
  "remark",
  "rehype",
  "mdast",
  "micromark",
  "hast",
  "vfile",
  "style-mod",
  "@marijn/find-cluster-break",
  "w3c-keyname",
  "crelt",
  "stringify-entities",
  "unist",
  "property-information",
  "markdown",
  "html-void-elements",
  "character-entities",
  "escape-string",
  "entities",
];

const replSdkDeps = [
  "repl-sdk",
  "resolve.imports",
  "resolve.exports",
  "change-case",
  "es-module-shims",
  "comlink",
  "mime",
  "package-name-regex",
  "tarparser",
];

export default defineConfig({
  build: {
    outDir: "dist",
    target: ["esnext"],
    minify: false,
    sourcemap: true,
    lib: {
      entry: [resolve(__dirname, "src/index.ts")],
      name: manifest.name,
      formats: ["es"],
    },
    rollupOptions: {
      external: externals,
      output: {
        // manualChunks(id) {
        //   if (id.includes("babel")) {
        //     return "babel";
        //   }
        //   if (id.includes("codemirror") || id.includes("lezer")) {
        //     if (id.includes("lang-")) {
        //       let [, tail] = id.split("lang-");
        //       let [name] = tail.split("/").filter(Boolean);
        //       return `codemirror_${name}`;
        //     }
        //
        //     return "codemirror";
        //   }
        //
        //   if (markdownDeps.some((x) => id.includes(x))) {
        //     return "markdown-support";
        //   }
        //
        //   if (replSdkDeps.some((x) => id.includes(x))) {
        //     if (id.includes("compilers")) {
        //       let [, tail] = id.split("compilers");
        //       let [name] = tail.split("/").filter(Boolean);
        //       return `repl-sdk_${name}`;
        //     }
        //     return "repl-sdk";
        //   }
        //
        //   if (id.includes("node_modules")) {
        //     if (id.includes("ember-repl")) {
        //       return "ember-repl";
        //     }
        //
        //     return "bundled-other-dependencies";
        //   }
        //   if (id.includes("ember-repl")) {
        //     return "ember-repl";
        //   }
        //
        //   console.log("o", id);
        //   return "other";
        // },
      },
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      outDir: "declarations",
    }),
  ],
});
