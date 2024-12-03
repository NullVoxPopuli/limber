import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import url from "node:url";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

let manifest = await (async () => {
  let buffer = await readFile(join(__dirname, "package.json"));

  return JSON.parse(buffer.toString());
})();

let externals = Object.keys({
  ...(manifest.dependencies || {}),
  ...(manifest.peerDependencies || {}),
});

export default defineConfig({
  build: {
    outDir: "dist",
    // These targets are not "support".
    // A consuming app or library should compile further if they need to support
    // old browsers.
    target: ["esnext"],
    // In case folks debug without sourcemaps
    //
    // TODO: do a dual build, split for development + production
    // where production is optimized for CDN loading via
    // https://limber.glimdown.com
    minify: false,
    sourcemap: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, "src/index.js"),
        "service-worker": resolve(__dirname, "src/service-worker/index.ts"),
      },
      name: "repl-sdk",
      formats: ["es"],
    },
    rollupOptions: {
      external: externals,
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      outDir: "declarations",
    }),
  ],
});
