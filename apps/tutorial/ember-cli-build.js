'use strict';

const fs = require('fs');
const path = require('path');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const globby = require('globby');

module.exports = function (defaults) {
  let environment = EmberApp.env();
  let isProduction = environment === 'production';

  const app = new EmberApp(defaults, {
    // Add options here
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  const { Webpack } = require('@embroider/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    extraPublicTrees: [
      // Tailwind
      require('@nullvoxpopuli/limber-styles/broccoli-funnel')(),
    ],
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
    packagerOptions: {
      webpackConfig: {
        plugins: [
          copyToPublic.webpack({ src: 'docs' }),
          createTutorialManifest.webpack({ src: 'docs', exclude: isProduction ? ['x-*'] : [] }),
        ],
      },
    },
  });
};

const { createUnplugin } = require('unplugin');

const copyToPublic = createUnplugin((options) => {
  let name = 'copy-files-to-public';
  let { src, include, dest } = options ?? {};

  dest ??= src;
  include ??= '**/*';

  return {
    name,
    async buildStart() {
      const files = globby.sync(include, { cwd: src });

      await Promise.all(
        files.map(async (file) => {
          let source = path.join(src, file);

          this.addWatchFile(source);

          await this.emitFile({
            type: 'asset',
            fileName: path.join(dest, file),
            source: fs.readFileSync(source).toString(),
          });
        })
      );
    },
    watchChange(id) {
      console.debug('watchChange', id);
    },
  };
});

const createTutorialManifest = createUnplugin((options) => {
  let { src, dest, name, include, exclude } = options ?? {};

  dest ??= src;
  name ??= 'manifest.json';
  include ??= '**/*';
  exclude ??= [];

  return {
    name: 'create-tutorial-manifest',
    async buildStart() {
      const globs = [include, ...exclude.map((e) => `!${e}`)];
      const paths = globby.sync(globs, {
        cwd: src,
        onlyDirectories: true,
        expandDirectories: true,
      });

      await this.emitFile({
        type: 'asset',
        fileName: path.join(dest, name),
        source: JSON.stringify(reshape(paths)),
      });
    },
    watchChange(id) {
      console.debug('watchChange', id);
    },
  };
});

/**
 * @param {string[]} paths
 */
function reshape(paths) {
  let grouped = parse(paths);

  let entries = Object.entries(grouped);
  let first = entries[0];
  let firstTutorial = grouped[first[0]][0];

  let list = entries.map(([, tutorials]) => tutorials);

  return {
    first: firstTutorial,
    list,
    grouped,
  };
}

/**
 * @typedef {object} Manifest
 * @property {string[]} sections
 *
 * @typedef {object} Tutorial
 * @property {string} path
 * @property {string} name
 * @property {string} groupName
 * @property {string} tutorialName
 *
 * I don't know if we want this shape long term?
 * @typedef {{ [group: string ]: Tutorial[] }} Tutorials
 *
 * @param {string[]} paths
 *
 * @returns {Tutorials}
 */
function parse(paths) {
  let result = {};

  for (let path of paths) {
    if (!path.includes('/')) {
      result[path] ||= [];
      continue;
    }

    let [group, name] = path.split('/');

    if (!group) continue;
    if (!name) continue;

    let groupName = group.replaceAll(/[\d-]/g, '');
    let tutorialName = name.replaceAll(/[\d-]/g, '');

    result[group] ||= [];
    result[group].push({ path: `/${path}`, name, groupName, tutorialName });
    result[group].sort(betterSort);
  }

  return result;
}

/**
 * Tutorials (and groups) are all 123-name
 * This is so that we can sort them manually on the file system.
 * However, it's human understanding that 10 comes after 9 and before 11,
 * instead of the file system default of after 1 and before 2.
 *
 * This sort function fixes the sort to be intuitive.
 * If some file systems correctly sort files starting with numbers,
 * then this is a no-op.
 */
function betterSort(a, b) {
  let aFull = a.name;
  let bFull = b.name;

  let [aNumStr, ...aRest] = aFull.split('-');
  let [bNumStr, ...bRest] = bFull.split('-');

  let aNum = Number(aNumStr);
  let bNum = Number(bNumStr);

  if (aNum < bNum) return -1;
  if (aNum > bNum) return 1;

  let aName = aRest.join('-');
  let bName = bRest.join('-');

  return aName.localeCompare(bName);
}
