import {
  assets,
  compatPrebuild,
  contentFor,
  hbs,
  optimizeDeps,
  resolver,
  scripts,
  templateTag,
} from "@embroider/vite";

import { babel } from "@rollup/plugin-babel";
import { defineConfig } from "vite";

const extensions = [".mjs", ".gjs", ".js", ".mts", ".gts", ".ts", ".hbs", ".json"];

export default defineConfig(({ mode }) => {
  let embroiderOptimize = optimizeDeps();

  console.log(embroiderOptimize.esbuildOptions);

  return {
    resolve: {
      extensions,
    },
    bulid: {
      target: "esnext",
    },
    plugins: [
      // hbs(), what's hbs? 🙈
      templateTag(),
      scripts(),
      resolver(),
      // compatPrebuild(), am I good enough?
      assets(),
      // contentFor(), I micro manage my HTML

      babel({
        babelHelpers: "runtime",
        extensions,
      }),
    ],
    optimizeDeps: {
      ...embroiderOptimize,
      esbuildOptions: {
        ...embroiderOptimize.esbuildOptions,
        target: "esnext",
      },
    },
    server: {
      port: 4200,
    },
    build: {
      outDir: "dist",
      rollupOptions: {
        input: {
          main: "index.html",
          ...(shouldBuildTests(mode) ? { tests: "tests/index.html" } : undefined),
        },
      },
    },
  };
});

function shouldBuildTests(mode) {
  return mode !== "production" || process.env.FORCE_BUILD_TESTS;
}
