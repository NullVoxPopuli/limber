import { ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { buildMacros } from '@embroider/macros/babel';
import { createRequire } from 'node:module';

const macros = buildMacros();
const require = createRequire(import.meta.url);

function getRenderer() {
  return {
    name: 'ember-astro',
    clientEntrypoint: 'ember-astro/client.js',
    serverEntrypoint: 'ember-astro/server.js',
  };
}

export function getContainerRenderer() {
  return {
    name: 'ember-astro',
    serverEntrypoint: 'ember-astro/server.js',
  };
}

export default function emberIntegration(/* options */) {
  return {
    name: 'ember-astro',
    hooks: {
      'astro:config:setup': async (options) => {
        let { updateConfig, addRenderer } = options;

        addRenderer(getRenderer());

        updateConfig({
          vite: {
            plugins: [
              ember(),
              babel({
                babelHelpers: 'runtime',
                extensions,
                plugins: [
                  [
                    '@babel/plugin-transform-typescript',
                    {
                      allExtensions: true,
                      onlyRemoveTypeImports: true,
                      allowDeclareFields: true,
                    },
                  ],
                  [
                    'babel-plugin-ember-template-compilation',
                    {
                      compilerPath: 'ember-source/dist/ember-template-compiler.js',
                      enableLegacyModules: [
                        'ember-cli-htmlbars',
                        'ember-cli-htmlbars-inline-precompile',
                        'htmlbars-inline-precompile',
                      ],
                      transforms: [...macros.templateMacros],
                    },
                  ],
                  [
                    'module:decorator-transforms',
                    {
                      runtime: {
                        import: require.resolve('decorator-transforms/runtime-esm'),
                      },
                    },
                  ],
                  [
                    '@babel/plugin-transform-runtime',
                    {
                      absoluteRuntime: import.meta.dirname,
                      useESModules: true,
                      regenerator: false,
                    },
                  ],
                  ...macros.babelMacros,
                ],
              }),
            ],
          },
        });
      },
    },
  };
}
