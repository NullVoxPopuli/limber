import { resolve, join } from "node:path";
import { readFile } from "node:fs/promises";
import url from "node:url";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

let manifest = await (async () => {
  let buffer = await readFile(join(__dirname, "package.json"));
  return JSON.parse(buffer.toString());
})();

let forcedExternals = [
  "unified",
  "remark-parse",
  "remark-rehype",
  "remark-gfm",
  "rehype-raw",
  "rehype-stringify",
  "mdast",
  "hast",
  "unist",
  "unist-util-visit",
  "vfile",
];

let externals = [
  ...Object.keys({
    ...(manifest.dependencies || {}),
    ...(manifest.peerDependencies || {}),
  }),
  ...forcedExternals,
];

export default defineConfig({
  worker: {
    format: "es",
    rollupOptions: {
      output: {
        dir: 'dist/data-worker.js',
      }
      external: [],
    },
  },
  build: {
    outDir: "dist",
    // These targets are not "support".
    // A consuming app or library should compile further if they need to support
    // old browsers.
    target: ["esnext"],
    // In case folks debug without sourcemaps
    //
    // TODO: do a dual build, split for development + production
    // where production is optimized for CDN loading via
    // https://limber.glimdown.com
    minify: false,
    sourcemap: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.js"),
      name: "repl-sdk",
      formats: ["es"],
      // the proper extensions will be added
      fileName: "index",
    },
    rollupOptions: {
      external: externals,
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      outDir: "declarations",
    }),
  ],
});
