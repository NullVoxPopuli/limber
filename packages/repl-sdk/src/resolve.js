import { exports as resolveExports } from 'resolve.exports';

import { parseSpecifier } from './specifier.js';

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

export function findInTar(untarred, request) {
  let { specifier } = request;

  if (resolveCache.has(specifier)) {
    return resolveCache.get(specifier);
  }

  let inTarFile = resolve(untarred, request);

  return inTarFile;
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @returns {undefined | import('./types.ts').RequestAnswer} the in-tar path
 */
export function resolve(untarred, request) {
  let answer = undefined;

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

function fromInternalImport(untarred, request, answer) {
  if (answer) return answer;
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

  let found = resolveExports(untarred.manifest, request.path, {
    conditions: CONDITIONS,
  });

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
  if (hasExports(untarred)) return answer;

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
  if (request.path !== '.') return;

  let filePath = untarred.manifest[entryName];

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

  if (request.path === '.') {
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

  let result = checkFile(untarred, request.path);

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
    /**
     * This will either be '.' or have the leading ./
     */
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
