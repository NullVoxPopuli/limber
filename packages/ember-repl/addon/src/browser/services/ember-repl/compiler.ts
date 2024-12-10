import { assert } from '@ember/debug';
import Service from '@ember/service';
import { waitFor } from '@ember/test-waiters';

import { PWBHost } from 'promise-worker-bi';
import { register } from 'register-service-worker';

import {
  type CompileResult,
  type GJSOptions,
  type GlimdownOptions,
  type HBSOptions,
  SUPPORTED_FORMATS,
} from '../../../types.ts';
import { nameFor } from '../../utils.ts';

import type { ComponentLike } from '@glint/template';

/**
 * TODO:
 * - Check if service worker is registered
 * - Check if worker exists
 *
 * Workflow:
 * - compile
 *   -> send to worker for initial work
 *      -> output ESM
 *      -> any imports here that are pre-defined (manually specified), should be swapped out with
 *         "globalThis" references -- maybe not directly on globalThis
 *      -> all other imports are changed to use `/ember-repl/import:${path or module}`
 *         so that the service worker can intercept it
 *
 *   -> fetch the blob of that output `/ember-repl/compiled:${blobtext}` (type application/javascript)
 *      -> service-worker intercepts and returns the decoded blobtext
 *         via Response
 *   -> the browser parses the returned JS module, and any remaining imports
 *       are handled be the service worker (in particular the `/ember-repl/import:...` imports)
 *       -> if an extension is present, we go back out to the worker to compiler probably
 *       -> if no extension, we fetch from esm.sh, and pass the response to the worker
 *          to repeat the initial process.
 *          -> traverse all imports until the module graph is complete
 *             this assures that if we need to compile something to be browser-compatible,
 *             we can.
 *
 *      Questions: do we need to compress here?
 *        (probably not?
 *           -- single files should not be that huge
 *              and the browser URL already has the compressed
 *              representation, which is more important for sharing
 *              and all that
 *        )
 *
 */
export default class Compiler extends Service {
  #workers = {
    compiler: null,
  } as {
    compiler: Worker | null;
  };
  #promiseWorkers = {
    compiler: null,
  } as { compiler: PWBHost | null };
  /**
   * Configures the workers for compiling
   */
  setup(urls: { serviceWorker: string; compiler: string }) {
    register(urls.serviceWorker, {
      ready: () => console.log('hello there'),
      registered(registration) {
        console.log('Service worker has been registered.');
      },
      cached(registration) {
        console.log('Content has been cached for offline use.');
      },
      updatefound(registration) {
        console.log('New content is downloading.');
      },
      updated(registration) {
        console.log('New content is available; please refresh.');
      },
      offline() {
        console.log('No internet connection found. App is running in offline mode.');
      },
      error(error) {
        console.error('Error during service worker registration:', error);
      },
    });

    this.#workers.compiler = new Worker(urls.compiler);
    this.#promiseWorkers.compiler = new PWBHost(this.#workers.compiler);

    this.#promiseWorkers.compiler.register(() => {
      // TODO: what is supposed to go here
      return 'registered from app service';
    });
  }

  #cache = new Map<string, ComponentLike>();

  /**
   * Compile a stateless component using just the template
   */

  compile(text: string, options: HBSOptions): Promise<ComponentLike | undefined>;

  /**
   * Compile GJS
   */
  compile(text: string, options: GJSOptions): Promise<ComponentLike | undefined>;

  /**
   * Compile GitHub-flavored Markdown with GJS support
   * and optionally render gjs-snippets via a `live` meta tag
   * on the code fences.
   */
  compile(text: string, options: GlimdownOptions): Promise<ComponentLike | undefined>;

  @waitFor
  async compile(
    text: string,
    options: GlimdownOptions | GJSOptions | HBSOptions
  ): Promise<ComponentLike | undefined> {
    let { onSuccess, onError, onCompileStart } = options;
    let id = nameFor(`${options.format}:${text}`);

    let existing = this.#cache.get(id);

    if (existing) {
      onSuccess(existing);

      return existing;
    }

    if (!SUPPORTED_FORMATS.includes(options.format)) {
      await onError(
        `Unsupported format: ${options.format}. Supported formats: ${SUPPORTED_FORMATS}`
      );

      return;
    }

    await onCompileStart();

    if (!text) {
      await onError('No Input Document yet');

      return;
    }

    let file = await this.#compile({
      text,
      format: options.format,
      options,
    });
    /**
     * 1. convert to blob
     * 2. import('/repl/module:blob')
     *    - default export is a CompileResult
     */
    let blob = new Blob([file]);
    // handled by the service worker's fetch handler
    let module = await import(/* @vite-ignore */ /* webpackIgnore: true */ `/repl/module:${blob}`);
    let result = module.default as CompileResult;

    if (result.error) {
      await onError(result.error.message || `${result.error}`);

      return;
    }

    this.#cache.set(id, result.component as ComponentLike);

    await onSuccess(result.component as ComponentLike);

    return result.component;
  }

  get #promileCompiler() {
    assert(`Cannot compile without the compiler-worker.`, this.#promiseWorkers.compiler);

    return this.#promiseWorkers.compiler;
  }

  async #compile(data: {
    text: string;
    format: string;
    options: GlimdownOptions | HBSOptions | GJSOptions;
  }): Promise<string> {
    return this.#promileCompiler.postMessage({
      command: 'compile',
      ...data,
    });
  }
}
