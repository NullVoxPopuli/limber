import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

/**
 * Writes a package.json with "type": "module" to the SSR output dir
 * so Node can load the bundle as ESM. This is what vite-ember-ssr's
 * plugin does for SSR builds, but we inline it here because the
 * plugin's isSsrBuild detection doesn't work with Vite 8 beta.
 */
function ssrPackageJson() {
  let resolvedConfig;

  return {
    name: 'ssr-package-json',
    configResolved(config) {
      resolvedConfig = config;
    },
    async closeBundle() {
      if (!resolvedConfig.build.ssr) return;

      const outDir = join(resolvedConfig.root, resolvedConfig.build.outDir);

      await mkdir(outDir, { recursive: true });
      await writeFile(
        join(outDir, 'package.json'),
        JSON.stringify({ type: 'module' }, null, 2),
        'utf-8',
      );
    },
  };
}

export default defineConfig({
  plugins: [
    ember(),
    babel({
      babelHelpers: 'runtime',
      skipPreflightCheck: true,
      extensions,
      configFile: './babel.config.mjs',
    }),
    icons({ autoInstall: true }),
    ssrPackageJson(),
  ],
  css: {
    postcss: './config/postcss.config.mjs',
  },
  build: {
    outDir: 'dist/server',
    target: 'node22',
    sourcemap: true,
    minify: false,
    ssr: 'app/app-ssr.ts',
  },
  // Bundle everything to avoid CJS/ESM interop issues in Node
  ssr: {
    noExternal: true,
  },
});
