import { classicEmberSupport, ember, extensions } from "@embroider/vite";

import { nodePolyfills } from "vite-plugin-node-polyfills";
import { babel } from "@rollup/plugin-babel";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: ["esnext"],
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
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: "runtime",
      extensions,
    }),

    // runtime babel... grrr
    nodePolyfills(),
  ],
});
