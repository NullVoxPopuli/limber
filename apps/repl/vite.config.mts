import { defineConfig } from "vite";
import { resolver, hbs, scripts, templateTag, addons } from "@embroider/vite";
import { resolve } from "node:path";
import module from 'node:module';
import { babel } from "@rollup/plugin-babel";

const root = "node_modules/.embroider/rewritten-app";
const require = module.createRequire(import.meta.url);

export default defineConfig({
  root,
  plugins: [
    hbs(),
    templateTag(),
    scripts(),
    resolver(),

    babel({
      babelHelpers: "runtime",

      // this needs .hbs because our hbs() plugin above converts them to
      // javascript but the javascript still also needs babel, but we don't want
      // to rename them because vite isn't great about knowing how to hot-reload
      // them if we resolve them to made-up names.
      extensions: [".gjs", ".gts", ".js", ".ts", ".hbs"],
    }),
  ],
  optimizeDeps: {
    exclude: [
      ...addons(__dirname),
    ],
    include: [
      'babel-plugin-ember-template-compilation',
    ],
  },
  server: {
    watch: {
      ignored: ["!**/node_modules/.embroider/rewritten-app/**"],
    },
  },
  build: {
    commonjsOptions: { include: [] },
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        tests: resolve(root, "tests/index.html"),
      },
    },
  },
   resolve: {
      alias: {
        path: "path-browserify",
      },
   }
});
