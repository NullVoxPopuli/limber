import { Addon } from "@embroider/addon-dev/rollup";

import { babel } from "@rollup/plugin-babel";
import cjs from "@rollup/plugin-commonjs";
import { execaCommand } from "execa";
import { defineConfig } from "rollup";

const addon = new Addon({
  srcDir: "src",
  destDir: "dist",
});

export default defineConfig({
  output: addon.output(),
  external: ["@glimmer/compiler", "@glimmer/syntax"],
  plugins: [
    addon.publicEntrypoints(["**/*.js"]),
    addon.appReexports([]),
    babel({
      extensions: [".js", ".gjs", ".ts", ".gts"],
      babelHelpers: "bundled",
    }),
    addon.dependencies(),
    // line-column...
    cjs(),
    addon.keepAssets(["build/**/*"]),
    addon.clean(),

    {
      async closeBundle() {
        await execaCommand("tsc --emitDeclarationOnly --noEmit false", { stdio: "inherit" });
        console.info("Declarations built successfully");
      },
    },
  ],
});
