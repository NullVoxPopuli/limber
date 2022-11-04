'use strict';

function hasDep(depName) {
  try {
    return Boolean(require.resolve(depName));
  } catch (e) {
    if (e.message.startsWith(`Cannot find module '${depName}'`)) return false;

    throw e;
  }
}

function proposedEmberDefault(personalPreferences) {
  let hasTypeScript = hasDep('typescript');
  let noPrettier = process.env.NO_PRETTIER;

  const configBuilder = {
    modules: {
      browser: {
        get js() {
          return {
            files: [
              '{src,app,addon,addon-test-support,tests}/**/*.{gjs,js}',
              'tests/dummy/config/deprecation-workflow.js',
              'config/deprecation-workflow.js',
            ],
            parser: 'babel-eslint',
            parserOptions: {
              ecmaVersion: 2022,
              sourceType: 'module',
              ecmaFeatures: {
                legacyDecorators: true,
              },
            },
            plugins: ['ember'],
            extends: [
              'eslint:recommended',
              'plugin:ember/recommended',
              ...(noPrettier ? [] : ['plugin:prettier/recommended']),
            ],
            env: {
              browser: true,
            },
            rules: {
              ...personalPreferences.rules,
            },
          }
        },
        get ts() {
          if (!hasTypeScript) return;

          return {
            files: ['{src,app,addon,addon-test-support,tests,types}/**/*.{gts,ts}'],
            parser: '@typescript-eslint/parser',
            plugins: ['ember'],
            extends: [
              'eslint:recommended',
              'plugin:ember/recommended',
              ...(noPrettier ? [] : ['plugin:prettier/recommended']),
              'plugin:@typescript-eslint/recommended',
            ],
            env: {
              browser: true,
            },
            rules: {
              // type imports are removed in builds
              '@typescript-eslint/consistent-type-imports': 'error',

              // prefer inference, but it is recommended to declare
              // return types around public API
              '@typescript-eslint/explicit-function-return-type': 'off',
              '@typescript-eslint/explicit-module-boundary-types': 'off',

              // Allows placeholder args to still be defined for
              // documentation or "for later" purposes
              '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
              ...personalPreferences.rules,
            },
          }
        },
        get declarations() {
          if (!hasTypeScript) return;

          return {
            files: ['**/*.d.ts'],
            extends: [
              'eslint:recommended',
              ...(noPrettier ? [] : ['plugin:prettier/recommended']),
              'plugin:@typescript-eslint/recommended',
            ],
            env: {
              browser: true,
            },
            rules: {
              '@typescript-eslint/no-empty-interface': 'off'
            }
          }
        }
      },
      tests: {
        get js() {
          let browserJS = configBuilder.modules.browser.js;
          return {
            ...browserJS,
            files: ['tests/**/*-test.{gjs,js}'],
            extends: [...browserJS.extends, 'plugin:qunit/recommended'],
          }
        },
        get ts() {
          if (!hasTypeScript) return;

          let browserTS = configBuilder.modules.browser.ts;

          return {
            ...browserTS,
            files: ['tests/**/*-test.{gts,ts}'],
            extends: [...browserTS.extends, 'plugin:qunit/recommended'],
          }
        },
      }
    },
    commonjs: {
      node: {
        get js() {
          return {
            files: [
              './*.{cjs,js}',
              './config/**/*.js',
              './lib/*/index.js',
              './server/**/*.js',
              './blueprints/*/index.js',
            ],
            parserOptions: {
              sourceType: 'script',
            },
            env: {
              browser: false,
              node: true,
            },
            plugins: ['node'],
            extends: ['plugin:node/recommended'],
            rules: {
              ...personalPreferences.rules,
              // this can be removed once the following is fixed
              // https://github.com/mysticatea/eslint-plugin-node/issues/77
              'node/no-unpublished-require': 'off',
            },
          }
        }
      }
    }
  }

  return configBuilder;
}


const personalPreferences = {
  rules: {
    // const has misleading safety implications
    // look in to "liberal let"
    'prefer-const': 'off',

    // people should know that no return is undefined in JS
    'getter-return': ['error', { allowImplicit: true }],

    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: '*', next: 'break' },
      { blankLine: 'always', prev: '*', next: 'block-like' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: ['const', 'let'], next: '*' },
      { blankLine: 'always', prev: '*', next: ['const', 'let'] },
      { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
      { blankLine: 'any', prev: ['*'], next: ['case'] },
    ],
  },
}

const config = proposedEmberDefault(personalPreferences);

module.exports = {
  root: true,
  /**
   * No root rules needed, because we define everything with overrides
   * so that understanding what set of rules is applied to what files
   * is easier to understand.
   *
   * This can be debugged with
   *
   * eslint --print-config ./path/to/file
   */
  rules: {},
  overrides: [
    config.commonjs.node.js,
    config.modules.browser.js,
    config.modules.browser.ts,
    config.modules.browser.declarations,
    config.modules.tests.js,
    config.modules.tests.ts,
  ].filter(Boolean),
};
