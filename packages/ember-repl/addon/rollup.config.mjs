import { babel } from "@rollup/plugin-babel";
import cjs from "@rollup/plugin-commonjs";
import { Addon } from "@embroider/addon-dev/rollup";
import copy from "rollup-plugin-copy";
import { defineConfig } from "rollup";

const addon = new Addon({
  srcDir: "src",
  destDir: "dist",
});

export default defineConfig({
  output: addon.output(),
  plugins: [
    addon.publicEntrypoints(["browser/**/*.js", "test-support/*.js"]),
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
  ],
});
