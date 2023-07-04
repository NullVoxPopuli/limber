import fs from "node:fs";
import path from "node:path";
import { globbySync } from "globby";
import { createUnplugin } from "unplugin";

export const copyToPublic = createUnplugin((options) => {
  let name = "copy-files-to-public";
  let { src, include, dest } = options ?? {};

  dest ??= src;
  include ??= "**/*";

  return {
    name,
    async buildStart() {
      const files = globbySync(include, { cwd: src });

      await Promise.all(
        files.map(async (file) => {
          let source = path.join(src, file);

          this.addWatchFile(source);

          await this.emitFile({
            type: "asset",
            fileName: path.join(dest, file),
            source: fs.readFileSync(source).toString(),
          });
        })
      );
    },
    watchChange(id) {
      console.debug("watchChange", id);
    },
  };
});

export const createTutorialManifest = createUnplugin((options) => {
  let { src, dest, name, include, exclude } = options ?? {};

  dest ??= src;
  name ??= "manifest.json";
  include ??= "**/*";
  exclude ??= [];

  return {
    name: "create-tutorial-manifest",
    async buildStart() {
      let paths = globbySync(include, {
        cwd: src,
        onlyDirectories: true,
        expandDirectories: true,
      });

      paths = paths.filter((path) => !exclude.some((pattern) => path.match(pattern)));

      await this.emitFile({
        type: "asset",
        fileName: path.join(dest, name),
        source: JSON.stringify(reshape(paths)),
      });
    },
    watchChange(id) {
      console.debug("watchChange", id);
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
    if (!path.includes("/")) {
      result[path] ||= [];
      continue;
    }

    let [group, name] = path.split("/");

    if (!group) continue;
    if (!name) continue;

    let groupName = group.replaceAll(/[\d-]/g, "");
    let tutorialName = name.replaceAll(/[\d-]/g, "");

    result[group] ||= [];
    result[group].push({ path: `/${path}`, name, groupName, tutorialName });
    result[group].sort(betterSort("name"));
  }

  // Objects' keys in JS are sorted as they are created.
  // Since we want to use `betterSort` on the keys, we need a new object.
  let sortedKeys = Object.keys(result).sort(betterSort());

  let actualResult = {};

  for (let sortedKey of sortedKeys) {
    actualResult[sortedKey] = result[sortedKey];
  }

  return actualResult;
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
function betterSort(property) {
  return (a, b) => {
    let aFull = property ? a[property] : a;
    let bFull = property ? b[property] : b;

    let [aNumStr, ...aRest] = aFull.split("-");
    let [bNumStr, ...bRest] = bFull.split("-");

    // Throw things starting with x at the end
    if (aNumStr === "x") return 1;
    if (bNumStr === "x") return 1;

    let aNum = Number(aNumStr);
    let bNum = Number(bNumStr);

    if (aNum < bNum) return -1;
    if (aNum > bNum) return 1;

    let aName = aRest.join("-");
    let bName = bRest.join("-");

    return aName.localeCompare(bName);
  };
}
