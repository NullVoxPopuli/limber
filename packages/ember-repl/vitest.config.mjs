import { ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import { defineConfig } from 'vitest/config';

import { emberRepl } from './vite/index.js';

/**
 * The same plugins as an ember app, and the plugin of this package.
 */
export default defineConfig({
  plugins: [
    emberRepl({
      imports: `import { Greeting } from '#tests-node/fixtures/greeting.gjs';`,
    }),
    ember(),
    babel({
      babelHelpers: 'inline',
      extensions,
    }),
  ],
  test: {
    environment: 'happy-dom',
    include: ['tests-node/**/*.test.ts'],
    server: {
      deps: {
        /**
         * Addons import `@ember/*` and call macros,
         * so each dependency has to go through the plugins above.
         */
        inline: true,
      },
    },
  },
});
