// @ts-nocheck
import { parse } from 'es-module-lexer';

export const virtualFSPrefix = 'file://virtualFS/';

async function orRoot(bucket) {
  if (bucket) return bucket;

  const result = await navigator.storage.getDirectory();

  console.log({ result });

  bucket = result;
}

/**
 * @param {string} source
 * @param {string} parentUrl
 */
export async function crawlImports(source, parentUrl, bucket) {
  bucket = await orRoot(bucket);

  const [imports, exports] = parse(source, 'optional-sourcename');

  await Promise.all(imports.map((i) => populate(i.n, parentUrl, bucket)));
}

/**
 * @param {string} specifier
 * @param {string} parentUrl
 */
export async function populate(specifier, parentUrl, bucket) {
  bucket = await orRoot(bucket);

  const url = new URL(specifier, 'https://esm.sh');

  console.info({ url: url.toString() });

  const response = await fetch(url);
  const text = await response.text();

  if (parentUrl) {
    virtualFS[parentUrl] ??= {};
    bucket = virtualFS[parentUrl];
  }

  bucket[specifier] = text;

  await crawlImports(text, specifier, bucket);
}

/**
 * @param {string} path
 */
async function parsePath(path) {
  const parts = path.split('/');

  const basename = parts.pop();
  const directory = parts.join('/');

  return {
    directory,
    basename,
  };
}

/**
 * @param {string} path
 */
async function mkdirp(path, bucket) {
  const root = await orRoot(bucket);

  const parts = path.split('/');

  let currentDir = root;

  while (parts.length) {
    const part = parts.shift();

    const handle = await currentDir.getDirectory(part, { create: true });

    currentDir = handle;
  }
}
