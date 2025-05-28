import { exports as resolveExports } from 'resolve.exports';

import { parseSpecifier } from './specifier.js';

/**
 * If a package wanted, they could provide a special export condition
 * targeting REPLs.
 *
 * This format should still be ESM.
 */
const CONDITIONS = ['repl', 'module', 'browser', 'import', 'default', 'development'];
const RESOLVE_VIA = ['exports', 'module', 'browser', 'main'];

/**
 * @type {Map<string, string>} specifier => filePath in the tgz
 */
const resolveCache = new Map();

export function findInTar(untarred, request) {
  let { specifier, path } = request;

  if (resolveCache.has(specifier)) {
    return resolveCache.get(specifier);
  }

  let inTarFile = resolve(untarred, path);

  // TODO: change this to answer format
  // { inTarFile, ext, from }
  // resolveCache.set(specifier, inTarFile);

  return inTarFile;
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {string} path
 * @returns {string} the in-tar path
 */
export function resolve(untarred, path) {
  for (let manifiestField of RESOLVE_VIA) {
    let result = resolveVia(untarred.manifest, path, manifiestField);

    let options = Array.isArray(result) ? result : [result];

    for (let option of options) {
      if (option) {
        let toFind = option.replace(/^\.\//, '');
        let code = untarred.contents[toFind]?.text;

        if (code) return toFind;
      }
    }
  }

  // Super fallback, just see if we can find the file...
  // This may be stupid, because not even node allows for this.
  //
  // Extensions will be required for this to work though
  let toFind = path.replace(/^\.\//, '');
  let code = untarred.contents[toFind]?.text;

  if (!code) {
    let parts = path.split('.');
    let ext = parts.pop();

    /**
     * For example,
     * '.' imports './foo.js'
     *
     * but ./foo.js isn't in package.json#exports, we still want to resolve the file.
     */
    if (ext) {
      let withoutExt = parts.join('.');

      return resolve(untarred, withoutExt);
    }
  }

  return toFind;
}

/**
 * @param {import('./types.ts').UntarredPackage['manifest']} manifest
 * @param {string} path
 * @param {'exports' | 'module' | 'browser' | 'main'} manifiestField
 */
function resolveVia(manifest, path, manifiestField) {
  let target = manifest[manifiestField];

  if (!target) return;

  if (typeof target === 'string') {
    return target;
  }

  if (typeof target === 'object') {
    return resolveExports(manifest, path, {
      conditions: CONDITIONS,
    });
  }
}

export class Request {
  static fromSpecifier(specifier) {
    return new Request(specifier);
  }

  /**
   * @type {null | { inTarFile: string, ext: string, from: string }}
   */
  answer = null;

  /**
   * @private
   */
  constructor(specifier) {
    let [full, query] = specifier.split('?');

    this.specifier = full;

    let parsed = parseSpecifier(this.specifier);
    let { name, version = 'latest', path } = parsed;

    this.name = name;
    this.version = version;
    this.path = path;

    if (query) {
      let search = new URLSearchParams(query);

      this.from = search.get('from');
      this.to = search.get('to');
    }
  }

  setAnswer(answer) {
    this.answer = answer;
  }
}
