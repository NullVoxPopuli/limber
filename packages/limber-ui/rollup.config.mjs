// @ts-nocheck
import { Addon } from "@embroider/addon-dev/rollup";

import { babel } from "@rollup/plugin-babel";
import { execaCommand } from "execa";
import { fixBadDeclarationOutput } from "fix-bad-declaration-output";
import { defineConfig } from "rollup";

const addon = new Addon({
  srcDir: "src",
  destDir: "dist",
});

export default defineConfig({
  output: addon.output(),
  plugins: [
    addon.publicEntrypoints(["index.js"]),
    addon.dependencies(),

    babel({
      extensions: [".js", ".gjs", ".ts", ".gts"],
      babelHelpers: "bundled",
    }),
    addon.gjs(),
    addon.keepAssets(["**/*.css"]),
    addon.clean(),

    {
      name: "build declarations",
      closeBundle: async () => {
        /**
         * Generate the types (these include /// <reference types="ember-source/types"
         * but our consumers may not be using those, or have a new enough ember-source that provides them.
         */
        await execaCommand(`pnpm glint --declaration`, { stdio: "inherit" });

        await fixBadDeclarationOutput("declarations/**/*.d.ts", ["TypeScript#56571", "Glint#628"]);

        console.log("⚠️ Dangerously (but neededly) fixed bad declaration output from typescript");
      },
    },
  ],
});
