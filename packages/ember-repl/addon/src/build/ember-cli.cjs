'use strict';

const { stripIndents } = require('common-tags');

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
