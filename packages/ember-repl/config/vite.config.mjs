import { ember, extensions } from "@embroider/vite";
import { join } from "node:path";

import { babel } from "@rollup/plugin-babel";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  build: {
    target: ["esnext"],
  },
  resolve: {
    alias: [
      {
        find: "ember-repl",
        replacement: join(import.meta.dirname, `../src`),
      },
    ],
  },
  optimizeDeps: {
    // a wasm-providing dependency
    exclude: ["content-tag"],
    // for top-level-await, etc
    esbuildOptions: {
      target: "esnext",
    },
  },
  plugins: [
    mkcert(),
    ember(),
    babel({
      babelHelpers: "inline",
      extensions,
    }),
  ],
});
