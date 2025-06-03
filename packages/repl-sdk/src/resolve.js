import { exports as resolveExports } from 'resolve.exports';

import { parseSpecifier } from './specifier.js';
import { fakeDomain, tgzPrefix } from './utils.js';

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
    .replace('___', '/');
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
export function resolve(untarred, request) {
  let answer = undefined;

  let { specifier } = request;

  if (resolveCache.has(specifier)) {
    return resolveCache.get(specifier);
  }

  answer ||= fromInternalImport(untarred, request, answer);
  answer ||= fromExportsString(untarred, request, answer);
  answer ||= fromExports(untarred, request, answer);
  answer ||= fromModule(untarred, request, answer);
  answer ||= fromBrowser(untarred, request, answer);
  answer ||= fromMain(untarred, request, answer);
  answer ||= fromIndex(untarred, request, answer);
  answer ||= fromFallback(untarred, request, answer);

  resolveCache.set(specifier, answer);

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

  let inTarFile = resolvePath(answerFrom.inTarFile, request.to);
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

  if (untarred.contents[filePath]) {
    return filePath;
  }

  let dotless = filePath.replace(/^\.\//, '');

  if (untarred.contents[dotless]) {
    return dotless;
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

  /** @type {string} */
  #to;

  /**
   * @private
   */
  constructor(specifier) {
    let removedPrefix = specifier
      .replace(tgzPrefix, '')
      .replace(fakeDomain + '/', '')
      .replace(fakeDomain, '')
      .replace(/^\//, '');
    let [full, query] = removedPrefix.split('?');

    this.original = specifier;
    this.specifier = full;

    let parsed = parseSpecifier(full);
    let { name, version = 'latest', path } = parsed;

    this.name = name;
    this.version = version;
    /**
     * This will either be '.' or have the leading ./
     */
    this.#to = path;

    if (query) {
      let search = new URLSearchParams(query);

      this.from = search.get('from').replace('tgz://', '').split('?')[0].replace(/^\//, '');
      this.#to = search.get('to').replace('//', '/');
    }
  }

  get to() {
    return this.#to;
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
  throw new Error(`Could not find file for ${request.specifier}`);
}
