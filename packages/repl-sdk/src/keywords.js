const KEYWORDS = new Set([
  `await`,
  'break',
  `async`,
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'super',
  'switch',
  'static',
  'this',
  'throw',
  'try',
  'true',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);

/**
 * @param {string} identifier
 */
export function isNotKeyword(identifier) {
  return !isKeyword(identifier);
}

/**
 * @param {string} identifier
 */
export function isKeyword(identifier) {
  return KEYWORDS.has(identifier);
}
