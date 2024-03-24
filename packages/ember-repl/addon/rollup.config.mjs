import { babel } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import { Addon } from "@embroider/addon-dev/rollup";
import copy from "rollup-plugin-copy";
import { defineConfig } from "rollup";
import { execaCommand } from "execa";

const mainThread = new Addon({ srcDir: "src", destDir: "dist" });
const sw = new Addon({ srcDir: "src/service-worker", destDir: "dist-sw" });

export default defineConfig([
  {
    output: mainThread.output(),
    external: ["@glimmer/compiler", "@glimmer/syntax"],
    plugins: [
      mainThread.publicEntrypoints(["index.js", "compile/formats/**/*.js"]),
      mainThread.appReexports([]),
      babel({
        extensions: [".js", ".gjs", ".ts", ".gts"],
        babelHelpers: "bundled",
      }),
      mainThread.dependencies(),
      mainThread.keepAssets(["build/**/*"]),
      {
        async closeBundle() {
          await execaCommand("tsc --emitDeclarationOnly --noEmit false", { stdio: "inherit" });
          console.info("Declarations built successfully");
        },
      },
    ],
  },
  {
    output: {
      file: "dist-sw/sw.js",
      format: "es",
      sourcemap: true,
    },
    plugins: [
      sw.publicEntrypoints(["sw.js"]),
      babel({
        extensions: [".ts"],
        babelHelpers: "bundled",
      }),
      resolve(),
      terser({
        mangle: false,
        format: {
          semicolons: false,
          ecma: 2022,
        },
        compress: {
          module: true,
          passes: 4,
          unsafe_math: true,
          hoist_funs: true,
          conditionals: true,
          drop_debugger: true,
          evaluate: true,
          reduce_vars: true,
          side_effects: true,
          dead_code: true,
          defaults: true,
          unused: true,
        },
      }),
    ],
  },
]);
