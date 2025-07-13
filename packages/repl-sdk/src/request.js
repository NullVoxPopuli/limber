import { cache } from './cache.js';
import { parseSpecifier } from './specifier.js';
import { assert, unzippedPrefix } from './utils.js';

let requestId = 1;

function requestKey() {
  return `repl-request-${requestId++}`;
}

/**
 * @param {{ to: string, from?: string }} options
 * @returns {string} the id of the request
 */
export function idForRequest({ to, from }) {
  const url = getTarRequestId({ to, from });

  return idFromRequestUrl(url);
}

/**
 * @param {{ to: string, from?: string }} options
 * @returns {string} the URL of the request
 */
export function getTarRequestId({ to, from }) {
  const request = Request.of({ to, from });

  const key = requestKey();

  cache.requestCache.set(key, request);

  return `${unzippedPrefix}/${key}`;
}

/**
 * @param {string} url
 * @returnns {string}
 */
export function idFromRequestUrl(url) {
  return url.replace(unzippedPrefix + '/', '');
}

export class Request {
  static get #idCache() {
    return cache.requestCache;
  }

  /**
   * @param {{ to: string, from?: string }} toFrom
   */
  static of({ to, from }) {
    const isRoot = to.match(/^[A-Za-z@]/);
    const fromId = from?.replace(unzippedPrefix + '/', '');
    const request = Request.fromSpecifier(isRoot ? to : `${to}?from=${fromId}`);

    return request;
  }

  /**
   * @param {string} id
   */
  static fromRequestId(id) {
    const request = Request.#idCache.get(id);

    assert(`Could not find request from id:${id}`, request);

    return request;
  }

  /**
   * @param {string} specifier
   */
  static fromSpecifier(specifier) {
    return new Request(specifier);
  }

  /** @type {string} */
  #to;

  /** @type {Request | undefined} */
  #from;

  /**
   * @private
   * @param {string} specifier
   */
  constructor(specifier) {
    const removedPrefix = specifier.replace(unzippedPrefix, '');
    const [full, query] = removedPrefix.split('?');

    this.original = specifier;

    assert(`Invalid specifier: ${specifier}`, full);

    if (full.startsWith('.') || full.startsWith('#')) {
      if (!query) {
        throw new Error(
          `Missing query, ?from for specifier: ${specifier}. From is required for relative and subpath-imports.`
        );
      }
    }

    /**
     * This will either be '.' or have the leading ./
     */
    this.#to = full;

    if (query) {
      const search = new URLSearchParams(query);
      const fromQp = search.get('from');

      assert(`Missing query, ?from for specifier: ${specifier}`, fromQp);

      const from = Request.fromRequestId(fromQp);

      this.#from = from;
      this.name = from.name;
      this.version = from.version;
    } else {
      const parsed = parseSpecifier(full);
      const { name, version = 'latest', path } = parsed;

      this.name = name;
      this.version = version.replace(/\.+$/, '');
      this.#to = path;
    }
  }

  get to() {
    return this.#to;
  }

  get from() {
    return this.#from;
  }

  get key() {
    return `__name__/${this.name}[AT:V]${this.version}/__to__/${this.to}`;
  }
}
