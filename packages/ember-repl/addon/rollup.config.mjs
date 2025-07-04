import { Addon } from "@embroider/addon-dev/rollup";

import { babel } from "@rollup/plugin-babel";
import cjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { execaCommand } from "execa";
import { defineConfig } from "rollup";
import nodePolyfills from "rollup-plugin-node-polyfills";

const addon = new Addon({
  srcDir: "src",
  destDir: "dist",
});

export default defineConfig({
  output: addon.output(),
  external: ["@glimmer/compiler", "@glimmer/syntax", "embebr-source"],
  plugins: [
    addon.publicEntrypoints(["**/*.js"]),
    addon.appReexports(["./services/compiler.js"]),
    babel({
      extensions: [".js", ".gjs", ".ts", ".gts"],
      babelHelpers: "bundled",
    }),
    addon.dependencies(),

    // Any dep not marked as external (by addon.dependencies()) gets bundled
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      // Defaults for this plugin are for node...
      exportConditions: ["browser", "module", "default"],
    }),
    // This is needed because babel doesn't ship a proper browser bundle...
    nodePolyfills(),
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
