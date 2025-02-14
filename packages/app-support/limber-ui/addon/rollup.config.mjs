import { Addon } from "@embroider/addon-dev/rollup";

import { babel } from "@rollup/plugin-babel";
import { defineConfig } from "rollup";

const addon = new Addon({
  srcDir: "src",
  destDir: "dist",
});

export default defineConfig({
  output: addon.output(),
  plugins: [
    addon.publicEntrypoints(["**/*.js"]),
    addon.dependencies(),

    babel({
      extensions: [".js", ".gjs", ".ts", ".gts"],
      babelHelpers: "bundled",
    }),
    addon.gjs(),
    addon.keepAssets(["**/*.css"]),
    addon.declarations("declarations"),
    addon.clean(),
  ],
});
