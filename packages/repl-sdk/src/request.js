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
  let url = getTarRequestId({ to, from });

  return idFromRequestUrl(url);
}

/**
 * @param {{ to: string, from?: string }} options
 * @returns {string} the URL of the request
 */
export function getTarRequestId({ to, from }) {
  let request = Request.of({ to, from });

  let key = requestKey();

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
  static #idCache = cache.requestCache;
  /**
   * @param {{ to: string, from?: string }} toFrom
   */
  static of({ to, from }) {
    let isRoot = to.match(/^[A-Za-z@]/);
    let fromId = from?.replace(unzippedPrefix + '/', '');
    let request = Request.fromSpecifier(isRoot ? to : `${to}?from=${fromId}`);

    return request;
  }

  /**
   * @param {string} id
   */
  static fromRequestId(id) {
    let request = Request.#idCache.get(id);

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
    let removedPrefix = specifier.replace(unzippedPrefix, '');
    let [full, query] = removedPrefix.split('?');

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
      let search = new URLSearchParams(query);
      let fromQp = search.get('from');

      assert(`Missing query, ?from for specifier: ${specifier}`, fromQp);

      let from = Request.fromRequestId(fromQp);

      this.#from = from;
      this.name = from.name;
      this.version = from.version;
    } else {
      let parsed = parseSpecifier(full);
      let { name, version = 'latest', path } = parsed;

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
