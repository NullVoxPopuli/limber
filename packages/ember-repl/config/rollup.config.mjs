import { Addon } from "@embroider/addon-dev/rollup";
import { resolve } from "node:path";

import { babel } from "@rollup/plugin-babel";
import cjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import nodePolyfills from "rollup-plugin-node-polyfills";

const addon = new Addon({
  srcDir: "src",
  destDir: "dist",
});

const babelConfig = resolve(import.meta.dirname, "./babel.publish.config.cjs");
const tsConfig = resolve(import.meta.dirname, "./tsconfig.publish.json");

export default {
  output: addon.output(),
  plugins: [
    addon.publicEntrypoints(["**/*.js"]),
    addon.dependencies(),
    babel({
      extensions: [".js", ".gjs", ".ts", ".gts"],
      babelHelpers: "bundled",
      configFile: babelConfig,
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      // Defaults for this plugin are for node...
      exportConditions: ["browser", "module", "default"],
    }),
    // This is needed because babel doesn't ship a proper browser bundle...
    nodePolyfills(),
    // line-column, unified (extend)...
    cjs(),

    // Emit .d.ts declaration files
    addon.declarations("declarations", `pnpm glint --declaration --project ${tsConfig}`),

    // Remove leftover build artifacts when starting a new build.
    addon.clean(),
  ],
};
