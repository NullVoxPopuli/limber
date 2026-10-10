import { createRequire } from 'node:module';

import { transformAsync } from '@babel/core';
import { buildMacros } from '@embroider/macros/babel';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);

/**
 * `@ember/*` and `@glimmer/*` are not packages. They are files in ember-source.
 * An app build maps them with embroider. Node needs the same map.
 */
function emberSourceModules() {
  const renamed = require('ember-source/package.json')['ember-addon'][
    'renamed-modules'
  ];

  return {
    name: 'ember-source-modules',
    enforce: 'pre',
    /**
     * @param {string} id
     */
    resolveId(id) {
      const target = renamed[`${id}.js`] ?? renamed[`${id}/index.js`];

      if (target) return this.resolve(target);
    },
  };
}

/**
 * Addons call `@embroider/macros`, which only works after its babel plugin ran.
 * An app build runs that plugin on each addon.
 */
function embroiderMacros() {
  const macros = buildMacros();

  return {
    name: 'embroider-macros',
    /**
     * @param {string} code
     * @param {string} id
     */
    async transform(code, id) {
      if (!code.includes('@embroider/macros')) return;

      const result = await transformAsync(code, {
        filename: id,
        plugins: macros.babelMacros,
        configFile: false,
        babelrc: false,
        sourceMaps: true,
      });

      return result
        ? { code: result.code ?? code, map: result.map }
        : undefined;
    },
  };
}

export default defineConfig({
  plugins: [emberSourceModules(), embroiderMacros()],
  resolve: {
    conditions: ['development'],
  },
  test: {
    environment: 'happy-dom',
    include: ['tests-node/**/*.test.ts'],
    server: {
      deps: {
        /**
         * Addons import `@ember/*`, so each dependency has to go through the plugins above.
         */
        inline: true,
      },
    },
  },
});
