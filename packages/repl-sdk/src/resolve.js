import { exports as resolveExports } from 'resolve.exports';
import { resolve as resolveImports } from 'resolve.imports';

/**
 * @typedef {import('./request.js').Request} Request
 */
import { assert, fakeDomain } from './utils.js';

/**
 * If a package wanted, they could provide a special export condition
 * targeting REPLs.
 *
 * This format should still be ESM.
 * CJS is not supported in browsers, and I won't support CJS in this REPL.
 */
const CONDITIONS = ['repl', 'module', 'browser', 'import', 'default', 'development'];

/**
 * @type {Map<string, import('./types.ts').RequestAnswer>} specifier => filePath in the tgz
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
  const base = start.replace(/^@([^/]+)\/([^/]+)/, `${AT}$1___$2`);

  const url = new URL(target, fakeProtocol + fakeDomain + base);

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

  const key = request.key;

  if (resolveCache.has(key)) {
    return resolveCache.get(key);
  }

  answer ||= fromImports(untarred, request, answer);
  answer ||= fromInternalImport(untarred, request, answer);
  answer ||= fromExportsString(untarred, request, answer);
  answer ||= fromExports(untarred, request, answer);
  answer ||= fromModule(untarred, request, answer);
  answer ||= fromBrowser(untarred, request, answer);
  answer ||= fromMain(untarred, request, answer);
  answer ||= fromIndex(untarred, request, answer);
  answer ||= fromFallback(untarred, request, answer);

  if (answer) {
    resolveCache.set(key, answer);
  }

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

  if (!request.from) return answer;

  const fromSpecifier = request.from;
  const answerFrom = resolve(untarred, fromSpecifier);

  if (!answerFrom) {
    printError(untarred, fromSpecifier, answer);

    return;
  }

  const inTarFile = resolvePath(
    fromSpecifier.name + '/' + answerFrom.inTarFile,
    request.to
  ).replace(new RegExp(`^${fromSpecifier.name}/`), '');
  const result = checkFile(untarred, inTarFile);

  if (result) {
    return createAnswer(result, request, 'internalImport');
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

  const exports = untarred.manifest.exports;

  if (!(typeof exports === 'object')) return answer;

  const foundArray = resolveExports(untarred.manifest, request.to, {
    conditions: CONDITIONS,
  });

  const found = foundArray?.map((f) => checkFile(untarred, f)).find(Boolean);

  if (found) {
    return createAnswer(found, request, 'exports');
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

  const imports = untarred.manifest.imports;

  if (!(typeof imports === 'object')) return answer;

  const found = resolveImports({ content: untarred.manifest }, request.to, {
    conditions: CONDITIONS,
  });

  if (found) {
    return createAnswer(found.replace(/^\.\//, ''), request, 'imports');
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

  const filePath = untarred.manifest[/** @type {keyof typeof untarred.manifest} */ (entryName)];

  if (!filePath || typeof filePath !== 'string') return;

  const result = checkFile(untarred, filePath);

  if (result) {
    return createAnswer(result, request, entryName);
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

  const result = checkFile(untarred, request.to);

  if (result) {
    return createAnswer(result, request, 'fallback');
  }
}

/**
 *
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {string | undefined} filePath
 * @returns {string | undefined} the variant
 */
function checkFile(untarred, filePath) {
  if (!filePath) return;

  for (const prefix of ['', 'pkg/']) {
    const path = prefix + filePath;
    const dotless = prefix + filePath.replace(/^\.\//, '');

    if (untarred.contents[path]) {
      return path;
    }

    if (untarred.contents[dotless]) {
      return dotless;
    }
  }
}

/**
 * @param {string} filePath
 */
function extName(filePath) {
  return filePath.split('.').pop();
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 */
function hasExports(untarred) {
  return Boolean(untarred.manifest.exports);
}

/**
 * @param {string} forFile
 * @param {Request} request
 * @param {string} fromMethod
 */
function createAnswer(forFile, request, fromMethod) {
  const ext = extName(forFile);

  assert(
    `All files must have an extension. This file (in ${request.name}) did not have an extension: ${forFile}`,
    ext
  );

  return {
    inTarFile: forFile,
    ext,
    from: fromMethod,
  };
}

/**
 * @param {import('./types.ts').UntarredPackage} untarred
 * @param {Request} request
 * @param {undefined | import('./types.ts').RequestAnswer} answer
 * @throws {Error}
 */
export function printError(untarred, request, answer) {
  const { name, exports, main, module, browser } = untarred.manifest;

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
