'use strict';

const path = require('path');
const { stripIndents } = require('common-tags');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: require('./package').name,

  options: {
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
    babel: {
      plugins: [require.resolve('ember-auto-import/babel-plugin')],
    },
    autoImport: {
      webpack: {
        node: {
          global: false,
          __filename: true,
          __dirname: true,
        },
        resolve: {
          fallback: {
            path: 'path-browserify',
          },
        },
      },
    },
  },

  included() {
    this._super.included.apply(this, arguments);

    const app = this._findHost(this);

    // Adds:
    //  - ember-template-compiler
    //  - @glimmer/syntax
    app.import('vendor/ember/ember-template-compiler.js');
  },

  /**
   * This technique can't be used because it duplicates the modules
   * in traditional builds. Additionally, because this way
   * doesn't utilize a service worker, we can't also point all the
   * imports within these files to the other files we've copied.
   */
  __treeForPublic() {
    const publicTree = this._super.treeForPublic.apply(this, arguments);

    const app = this._findHost(this);
    const root = app.project.root;
    const dist = path.join(root, 'node_modules/ember-source/dist/packages');
    const trees = [];

    if (publicTree) {
      trees.push(publicTree);
    }

    let packages = new Funnel(dist, {
      annotation: 'ember-repl adding ember ESM from ember-source/dist/packages',
      destDir: '/',
    });

    trees.push(packages);

    return mergeTrees(trees);
  },
};

/**
 * Builds a file with a single export, COMPONENT_MAP, that
 * is a map of the provided paths *to* all exported identifiers
 * from each of the provided paths.
 *
 * This is helpful for building a map of imports to force to be included
 * in the build - a requirement for builds that tend to tree shake.
 *
 * @param {string[]} paths - list of import paths for each module that you want availableb to the REPL
 */
module.exports.buildComponentMap = function buildComponentMap(paths) {
  const writeFile = require('broccoli-file-creator');
  const fileContent = stripIndents`
    ${paths
      .map((path, i) => {
        return `import * as ComponentMapPart${i} from '${path}';`;
      })
      .join('\n')}

    export const COMPONENT_MAP = {
      ${paths
        .map((path, i) => {
          return `'${path}': ComponentMapPart${i},`;
        })
        .join('\n')}
    };
  `;

  const tree = writeFile('/ember-repl/component-map.js', fileContent);

  return tree;
};
