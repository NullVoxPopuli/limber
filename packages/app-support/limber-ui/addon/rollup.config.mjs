// @ts-nocheck
import { Addon } from "@embroider/addon-dev/rollup";
import { babel } from "@rollup/plugin-babel";
import copy from "rollup-plugin-copy";
import { defineConfig } from "rollup";
import { execaCommand } from "execa";
import { fixBadDeclarationOutput } from "fix-bad-declaration-output";

const addon = new Addon({
  srcDir: "src",
  destDir: "dist",
});

export default defineConfig({
  // https://github.com/rollup/rollup/issues/1828
  watch: {
    chokidar: {
      usePolling: true,
    },
  },
  output: addon.output(),
  plugins: [
    addon.publicEntrypoints(["**/*.js"]),
    addon.appReexports(["components/external-link.js", "components/code.js"]),

    addon.dependencies(),

    babel({
      extensions: [".js", ".gjs", ".ts", ".gts"],
      babelHelpers: "bundled",
    }),
    addon.hbs(),
    addon.gjs(),
    addon.keepAssets(["**/*.css"]),
    addon.clean(),

    // Copy Readme and License into published package
    copy({
      targets: [
        { src: "../README.md", dest: "." },
        { src: "../LICENSE.md", dest: "." },
      ],
    }),

    {
      name: "build declarations",
      closeBundle: async () => {
        /**
         * Generate the types (these include /// <reference types="ember-source/types"
         * but our consumers may not be using those, or have a new enough ember-source that provides them.
         */
        console.log("Building types");
        await execaCommand(`pnpm glint --declaration`, { stdio: "inherit" });

        // console.log("Fixing types");
        // await fixBadDeclarationOutput("declarations/**/*.d.ts", ["TypeScript#56571", "Glint#628"]);
        // console.log("⚠️ Dangerously (but neededly) fixed bad declaration output from typescript");
      },
    },
  ],
});
