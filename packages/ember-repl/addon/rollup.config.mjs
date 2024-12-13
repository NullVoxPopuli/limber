import { Addon } from "@embroider/addon-dev/rollup";

import alias from "@rollup/plugin-alias";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { defineConfig } from "rollup";

const browser = new Addon({ srcDir: "src/browser", destDir: "dist/browser" });
const compiler = new Addon({ srcDir: "src/compiler-worker", destDir: "dist/compiler-worker" });
const sw = new Addon({ srcDir: "src/service-worker", destDir: "dist/service-worker" });

function ember(name) {
  return `./node_modules/ember-source/dist/${name}`;
}

function pkg(name) {
  return ember(`packages/${name}`);
}

const lookup = {
  "@ember/debug": pkg("@ember/debug/index.js"),
  "@ember/template-factory": pkg("@ember/template-factory/index.js"),
  "@ember/helper": pkg("@ember/helper/index.js"),
  "@ember/modifier": pkg("@ember/modifier/index.js"),
  "@ember/template-factory": pkg("@ember/template-factory/index.js"),
  "@ember/component": pkg("@ember/component/index.js"),
  "@ember/component/template-only": pkg("@ember/component/template-only.js"),
  // "ember-template-compiler": ember("ember-template-compiler.js"),
};

const output = {
  sourcemap: true,
  format: "es",
  hoistTransitiveImports: false,
  // moduleSideEffects: false,
  interop: "default",
};

function bundledEmber() {
  return alias([
    {
      find: /(@?ember.+)/,
      replacement: "$1",
      customResolver(source) {
        let result = lookup[source];

        return result;
      },
    },
  ]);
}

function worker(input, out) {
  return {
    input: input,
    external: [],
    output: {
      ...output,
      inlineDynamicImports: true,
      file: out,
    },
    plugins: [
      babel({
        extensions: [".js", ".gjs", ".ts", ".gts"],
        babelHelpers: "bundled",
      }),
      bundledEmber(),
      nodeResolve(),
      // unified>extends
      commonjs(),
    ],
  };
}

export default defineConfig([
  {
    output: browser.output(),
    plugins: [
      browser.publicEntrypoints(["**/*.js"]),
      browser.appReexports(["./services/ember-repl/compiler.js"]),
      babel({
        extensions: [".js", ".gjs", ".ts", ".gts"],
        babelHelpers: "bundled",
      }),
      browser.dependencies(),
    ],
  },
  worker("src/compiler-worker/index.ts", "dist/compiler-worker.js"),
  worker("src/markdown-worker/index.ts", "dist/markdown-worker.js"),
  {
    input: "src/service-worker/index.ts",
    output: {
      ...output,
      file: "dist/service-worker.js",
    },
    plugins: [
      babel({
        extensions: [".js", ".gjs", ".ts", ".gts"],
        babelHelpers: "bundled",
      }),
      bundledEmber(),
    ],
  },
]);
