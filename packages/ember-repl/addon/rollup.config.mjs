import ts from "rollup-plugin-ts";
import cjs from "@rollup/plugin-commonjs";
import { Addon } from "@embroider/addon-dev/rollup";
import copy from "rollup-plugin-copy";
import { defineConfig } from "rollup";

import { glimmerTemplateTag } from "rollup-plugin-glimmer-template-tag";

const addon = new Addon({
  srcDir: "src",
  destDir: "dist",
});

console.log(addon.output());

export default defineConfig({
  output: addon.output(),
  plugins: [
    addon.publicEntrypoints(["browser/**/*.js", "test-support/*.js"]),
    addon.appReexports([]),

    ts({
      transpiler: "babel",
      transpileOnly: true,
      babelConfig: "./babel.config.json",
      browserslist: ["last 2 firefox versions", "last 2 chrome versions"],
    }),

    addon.dependencies(),
    // line-column...
    cjs(),

    addon.keepAssets(["build/**/*"]),

    // No components in this addon, as it turns out
    // addon.hbs(),
    // glimmerTemplateTag({ preprocessOnly: true }),
    addon.clean(),
  ],
});
