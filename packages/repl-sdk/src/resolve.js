import { exports as resolveExports } from 'resolve.exports';
import { resolve as resolveImports } from 'resolve.imports';

import { parseSpecifier } from './specifier.js';
import { fakeDomain, tgzPrefix, unzippedPrefix } from './utils.js';

/**
 * If a package wanted, they could provide a special export condition
 * targeting REPLs.
 *
 * This format should still be ESM.
 */
const CONDITIONS = ['repl', 'module', 'browser', 'import', 'default', 'development'];

/**
 * @type {Map<string, string>} specifier => filePath in the tgz
 */
const resolveCache = new Map();

const AT = '___AT___';
const fakeProtocol = 'repl://';

/**
 *
 * @param {*} start packageName or packageName with file
 * @param {*} target file to resolve within the packageName
 * @returns
 */
export function resolvePath(start, target) {
  /**
   * How to make the whole package name look like one segment for URL
   */
  let base = start.replace(/^@([^/]+)\/([^/]+)/, `${AT}$1___$2`);

  let url = new URL(target, fakeProtocol + fakeDomain + base);

  /**
   * href omits the protocol
   * (which is what we want)
   */
  return url.href
    .replace(fakeProtocol + fakeDomain, '')
    .replace(AT, '@')
    .replace('___', '/')
    .replace(/^\//, './');
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
export function resolve(untarred, request) {
  let answer = undefined;

  let { key } = request;

  if (resolveCache.has(key)) {
    return resolveCache.get(key);
  }

  answer ||= _resolve(untarred, request, answer);
  answer ||= _resolve(untarred, Request.fromRequest(request, { from: request.name }), answer);

  resolveCache.set(key, answer);

  return answer;
}

function _resolve(untarred, request, answer) {
  answer ||= fromImports(untarred, request, answer);
  answer ||= fromInternalImport(untarred, request, answer);
  answer ||= fromExportsString(untarred, request, answer);
  answer ||= fromExports(untarred, request, answer);
  answer ||= fromModule(untarred, request, answer);
  answer ||= fromBrowser(untarred, request, answer);
  answer ||= fromMain(untarred, request, answer);
  answer ||= fromIndex(untarred, request, answer);
  answer ||= fromFallback(untarred, request, answer);

  return answer;
}

/**
 * These are likely all private imports
 *
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @param {undefined | import('./types.ts').RequestAnswer} answer
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
export function fromInternalImport(untarred, request, answer) {
  if (answer) return answer;

  let isInternal = request.from && request.to;

  if (!isInternal) return answer;

  let fromSpecifier = Request.fromSpecifier(request.from);
  let answerFrom = resolve(untarred, fromSpecifier);

  if (!answerFrom) printError(untarred, fromSpecifier, answer);

  let inTarFile = resolvePath(fromSpecifier.name + '/' + answerFrom.inTarFile, request.to).replace(
    new RegExp(`^${fromSpecifier.name}/`),
    ''
  );
  let result = checkFile(untarred, inTarFile);

  if (result) {
    return {
      inTarFile: result,
      ext: extName(result),
      from: 'internalImport',
    };
  }

  // Internal imports should always exist, unless a package is just broken.
  printError(untarred, request, answer);
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @param {undefined | import('./types.ts').RequestAnswer} answer
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
function fromExports(untarred, request, answer) {
  if (answer) return answer;

  let exports = untarred.manifest.exports;

  if (!(typeof exports === 'object')) return answer;

  let foundArray = resolveExports(untarred.manifest, request.to, {
    conditions: CONDITIONS,
  });

  let found = foundArray.map((f) => checkFile(untarred, f)).find(Boolean);

  if (found) {
    return {
      inTarFile: found,
      ext: extName(found),
      from: 'exports',
    };
  }
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @param {undefined | import('./types.ts').RequestAnswer} answer
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
export function fromImports(untarred, request, answer) {
  if (answer) return answer;
  if (!request.to.startsWith('#')) return answer;

  let imports = untarred.manifest.imports;

  if (!(typeof imports === 'object')) return answer;

  let found = resolveImports({ content: untarred.manifest }, request.to, {
    conditions: CONDITIONS,
  });

  if (found) {
    return {
      inTarFile: found.replace(/^\.\//, ''),
      ext: extName(found),
      from: 'imports',
    };
  }
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @param {undefined | import('./types.ts').RequestAnswer} answer
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
function fromExportsString(untarred, request, answer) {
  if (answer) return answer;
  if (!hasExports(untarred)) return answer;

  // technically not legacy, but it's the same logic
  return checkLegacyEntry(untarred, request, 'exports');
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @param {undefined | import('./types.ts').RequestAnswer} answer
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
function fromModule(untarred, request, answer) {
  if (answer) return answer;
  if (hasExports(untarred)) return answer;

  return checkLegacyEntry(untarred, request, 'module');
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @param {undefined | import('./types.ts').RequestAnswer} answer
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
function fromBrowser(untarred, request, answer) {
  if (answer) return answer;
  if (hasExports(untarred)) return answer;

  return checkLegacyEntry(untarred, request, 'browser');
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @param {undefined | import('./types.ts').RequestAnswer} answer
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
function fromMain(untarred, request, answer) {
  if (answer) return answer;
  if (hasExports(untarred)) return answer;

  return checkLegacyEntry(untarred, request, 'main');
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @param {string} entryName
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
function checkLegacyEntry(untarred, request, entryName) {
  if (request.to !== '.') return;

  let filePath = untarred.manifest[entryName];

  if (!filePath || typeof filePath !== 'string') return;

  let result = checkFile(untarred, filePath);

  if (result) {
    return {
      inTarFile: result,
      ext: extName(result),
      from: entryName,
    };
  }
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @param {undefined | import('./types.ts').RequestAnswer} answer
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
function fromIndex(untarred, request, answer) {
  if (answer) return answer;
  if (hasExports(untarred)) return answer;

  if (request.to === '.') {
    if (untarred.contents['index.js']) {
      return {
        inTarFile: 'index.js',
        ext: 'js',
        from: 'index',
      };
    }
  }
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @param {undefined | import('./types.ts').RequestAnswer} answer
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
function fromFallback(untarred, request, answer) {
  if (answer) return answer;

  let result = checkFile(untarred, request.to);

  if (result) {
    return {
      inTarFile: result,
      ext: extName(result),
      from: 'fallback',
    };
  }
}

/**
 *
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {string | undefined} filePath
 * @returns {string} the variant
 */
function checkFile(untarred, filePath) {
  if (!filePath) return;

  for (let prefix of ['', 'pkg/']) {
    let path = prefix + filePath;
    let dotless = prefix + filePath.replace(/^\.\//, '');

    if (untarred.contents[path]) {
      return path;
    }

    if (untarred.contents[dotless]) {
      return dotless;
    }
  }
}

function extName(filePath) {
  return filePath.split('.').pop();
}

function hasExports(untarred) {
  return Boolean(untarred.manifest.exports);
}

export class Request {
  static fromSpecifier(specifier) {
    return new Request(specifier);
  }
  static fromRequest(otherRequest, overrides) {
    let r = new Request(otherRequest.original);

    Object.assign(r, overrides);

    return r;
  }

  /** @type {string} */
  #to;

  /**
   * @private
   */
  constructor(specifier) {
    let removedPrefix = specifier
      .replace(unzippedPrefix, '')
      .replace(tgzPrefix, '')
      .replace(/^\//, '');
    let [full, query] = removedPrefix.split('?');

    this.original = specifier;

    if (full.startsWith('.') || full.startsWith('#')) {
      if (!query) {
        throw new Error(
          `Missing query, ?from for specifier: ${specifier}. From is required for relative and subpath-imports.`
        );
      }
    }

    if (query) {
      let search = new URLSearchParams(query);

      let fQP = search.get('from').replace(unzippedPrefix, '').replace(/^\//, '');
      let split = Request.splitKey(fQP);
      let specifier = `${split.name}@${split.version}${split.path}`

      this.#to = full;

      let parsed = parseSpecifier(specifier);

      this.from = resolvePath(parsed.name, parsed.path).replace(/\/$/, '');
      this.name = parsed.name;

      let cleanedVersion = parsed.version?.replace(/\.+$/, '') || 'latest';

      this.version = cleanedVersion;
    } else {
      let parsed = parseSpecifier(full);
      let { name, version = 'latest', path } = parsed;

      this.name = name;
      this.version = version.replace(/\.+$/, '');
      /**
       * This will either be '.' or have the leading ./
       */
      this.#to = path;
    }
  }

  get to() {
    return this.#to;
  }

  static splitKey(key) {
    let noHash = key.split('#')[0];
    let [nameStuff, versionAndPath] = noHash.split('[AT:V]');
    let name = nameStuff.replace(/^__name__\//, '');
    let [version, path] = versionAndPath.split('/__to__/');

    return { name, version, path };
  }

  get key() {
    return `__name__/${this.name}[AT:V]${this.version}/__to__/${this.to}`;
  }
}

export function printError(untarred, request, answer) {
  let { name, exports, main, module, browser } = untarred.manifest;

  console.group(`${name} file info`);
  console.info(`${name} has these files: `, Object.keys(untarred.contents));
  console.info(`We searched for '${request.original}'`);
  console.info(`from: `, { exports, main, module, browser });
  console.info(`And found: `, answer);
  console.info(`The request was: `, request);
  console.groupEnd();

  // eslint-disable-next-line no-debugger
  debugger;
  throw new Error(`Could not find file for ${request.original}`);
}
