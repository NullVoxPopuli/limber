import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * @typedef {object} Options
 * @property {RegExp} [include] which files are markdown documents. Default: files that end in `.gjs.md`
 * @property {string} [imports] import statements. The prose and the hbs demos can use what they import.
 * @property {unknown[]} [remarkPlugins]
 * @property {unknown[]} [rehypePlugins]
 */

/**
 * A `hbs` fence can belong to more than one framework.
 * In an ember project, it is ember.
 */
function hbsIsEmber() {
  /** @param {any} node */
  function walk(node) {
    if (node.type === 'code' && node.lang === 'hbs') {
      node.meta = node.meta ? `${node.meta} ember` : 'ember';
    }

    node.children?.forEach(walk);
  }

  return walk;
}

/**
 * Compiles markdown documents to components when the app builds.
 * Each live code fence in a document is a component in the same module.
 *
 * Nothing compiles in the browser for these files,
 * so a tool that pre-renders pages gets the whole page.
 *
 * Use it with the plugins that an ember project already has:
 *
 * ```js
 * import { ember, extensions } from '@embroider/vite';
 * import { babel } from '@rollup/plugin-babel';
 * import { emberRepl } from 'ember-repl/vite';
 *
 * export default defineConfig({
 *   plugins: [emberRepl(), ember(), babel({ babelHelpers: 'runtime', extensions })],
 * });
 * ```
 *
 * @param {Options} [options]
 */
export function emberRepl(options = {}) {
  const include = options.include ?? /\.gjs\.md$/;

  let root = globalThis.process.cwd();

  /** @type {Promise<{ compiler: any, babel: any }> | undefined} */
  let setup;

  /**
   * The compilers come from the project, so that they are the same
   * versions as the ones that build the rest of the app.
   */
  function load() {
    setup ??= (async () => {
      const require = createRequire(join(root, 'package.json'));

      /** @param {string} name */
      const fromProject = (name) =>
        import(pathToFileURL(require.resolve(name)).href);

      const babel = await fromProject('@babel/core');
      const { Compiler } = await import('repl-sdk');

      const compiler = new Compiler({
        resolve: {
          '@glimdown/babel-8-lite': () => ({
            ...babel,
            transform: babel.transformSync,
            availablePlugins: {
              get 'transform-typescript'() {
                return require('@babel/plugin-transform-typescript');
              },
            },
          }),
          'babel-plugin-ember-template-compilation': () =>
            fromProject('babel-plugin-ember-template-compilation'),
          'ember-source/ember-template-compiler/index.js': () =>
            fromProject('ember-source/ember-template-compiler/index.js'),
          'content-tag': () => fromProject('content-tag'),
        },
      });

      return { compiler, babel };
    })();

    return setup;
  }

  return {
    name: 'ember-repl',
    /**
     * The output has templates that are not compiled yet,
     * so this has to be before the plugins that compile them.
     */
    enforce: 'pre',

    /** @param {{ root: string }} config */
    configResolved(config) {
      root = config.root;
    },

    /** @param {string} id */
    async load(id) {
      const [path] = id.split('?');

      if (!path || !include.test(path)) return;

      const { compiler, babel } = await load();
      const text = await readFile(path, 'utf8');

      const { source } = await compiler.compileToSource('gmd', text, {
        imports: options.imports,
        remarkPlugins: [hbsIsEmber, ...(options.remarkPlugins ?? [])],
        rehypePlugins: options.rehypePlugins ?? [],
      });

      /**
       * The babel plugin of the project only takes files with a JS extension,
       * and this file ends in `.md`. So babel runs here, with the config of the project.
       */
      const result = await babel.transformAsync(source, {
        filename: path,
        root,
        sourceType: 'module',
        sourceMaps: true,
      });

      return { code: result.code, map: result.map };
    },
  };
}
