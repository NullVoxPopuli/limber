import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying, registerDestructor } from '@ember/destroyable';
import { service } from '@ember/service';
import { buildWaiter } from '@ember/test-waiters';
import { isTesting, macroCondition } from '@embroider/macros';

import { Project } from 'repl-sdk/project';
import { readStoredProject, writeStoredProject } from 'repl-sdk/project/local-storage';
import { readProject, writeProject } from 'repl-sdk/project/url';

import { flavorFrom, formatFrom, type FormatQP } from '#app/languages.gts';

import type RouterService from '@ember/routing/router-service';

const DEBOUNCE_MS = 250;
const commitWaiter = buildWaiter('ProjectState::commit');

export async function shortenUrl(url: string) {
  const response = await fetch(`https://api.nvp.gg/v1/links`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({ originalUrl: url }),
  });

  const json = await response.json();
  const shortUrl = json.data.attributes.shortUrl;

  /**
   * We don't need to replace if the REPL is on the nvp.gg domain
   */
  if (location.href.includes('glimdown.com')) {
    // fake our custom domain
    // Will be done for us later
    return shortUrl.replace('nvp.gg', 'share.glimdown.com');
  }

  return shortUrl;
}

/**
 * The document the user last worked on in a given format, if there is one.
 */
export function getStoredDocumentForFormat(format: FormatQP) {
  return readStoredProject({ format })?.entry?.text ?? null;
}

/**
 * The Project is the source of truth. The URL is one of the ways it is stored.
 *
 * Reads happen through the adapters at boot, and again any time nothing has
 * been committed yet. Writes are debounced, because committing is what
 * triggers a recompile.
 *
 * NOTE: this never sets the editor content. Editor content flows one way into
 *       here, and `services/editor` pushes it back into CodeMirror when
 *       something other than typing changes the document.
 */
export class ProjectState {
  @service declare router: RouterService;

  @tracked private _committed: Project | undefined;

  #pending: { project: Project; extraQPs: Record<string, string> } | undefined;
  #tokens: unknown[] = [];

  constructor() {
    registerDestructor(this, () => this.#cleanup());
  }

  /**
   * Committed state, falling back to whatever the URL says while the app is
   * still booting.
   */
  get project(): Project {
    return this._committed ?? readProject(this.#params) ?? Project.empty;
  }

  get text(): string | null {
    return this.project.entry?.text ?? null;
  }

  get format(): FormatQP {
    return formatFrom(this.project.format || this.#params.get('format'));
  }

  get flavor() {
    return flavorFrom(this.format, this.#params.get('flavor'));
  }

  /**
   * Called on every keystroke.
   *
   * Builds on whatever is staged rather than on what is committed. Swapping
   * the document makes CodeMirror report the new text back to us, and that
   * arrives before the swap has been committed.
   */
  queue = (text: string) => {
    const base = this.#staged;

    this.#stage(base.withEntryText(text, { format: base.format || this.format }));
  };

  /**
   * Replace the whole document. `extraQPs` are view options a demo wants
   * along with its code, such as turning off the shadow dom.
   */
  set = (text: string, format: FormatQP, extraQPs?: undefined | Record<string, string>) => {
    this.#stage(Project.single(text, { format }), extraQPs);
  };

  /**
   * Keep the text, change how it is interpreted. Also the path for old URLs
   * that never said what format they were in.
   */
  forceFormat = (format: FormatQP) => {
    this.#stage(this.#staged.withFormat(format));
  };

  flush = async () => {
    await Promise.resolve();
    this.#commit();
  };

  /**
   * When the user presses control+s or command+s,
   * - wait for the queue to flush
   *   - copy the updated URL to the clipboard
   *   - display a message to the user that the URL is now in their clipboard
   */
  toClipboard = async () => {
    await this.flush();

    let url = location.origin + this.router.currentURL;

    if (window.location.href.includes('glimdown.com')) {
      try {
        url = await shortenUrl(url);
      } catch (e) {
        console.error(`Could not shorten the URL`);
        console.error(e);
      }
    }

    await navigator.clipboard.writeText(url);
  };

  get #params() {
    return new URL(currentURL(this.router)).searchParams;
  }

  /**
   * The newest document, committed or not.
   */
  get #staged() {
    return this.#pending?.project ?? this.project;
  }

  #stage = (project: Project, extraQPs?: undefined | Record<string, string>) => {
    this.#pending = {
      project,
      extraQPs: { ...this.#pending?.extraQPs, ...extraQPs },
    };

    this.#tokens.push(commitWaiter.beginAsync());
    this.#schedule();
  };

  #schedule = makeDebounced(() => {
    if (isDestroyed(this) || isDestroying(this)) {
      this.#cleanup();

      return;
    }

    this.#commit();
  });

  #commit = () => {
    this.#schedule.clear();

    const pending = this.#pending;

    this.#pending = undefined;

    if (!pending || pending.project.isEmpty) {
      this.#cleanup();

      return;
    }

    const { extraQPs } = pending;

    /**
     * Every URL we write names its format, even when the incoming one didn't.
     */
    const project = pending.project.format
      ? pending.project
      : pending.project.withFormat(this.format);

    writeStoredProject(project);

    this._committed = project;

    const current = new URL(currentURL(this.router));
    const next = writeProject(project, { into: current.searchParams });

    for (const [key, value] of Object.entries(extraQPs)) {
      next.set(key, value);
    }

    if (isSameQuery(next, current.searchParams)) {
      this.#cleanup();

      return;
    }

    this.router.replaceWith(`${editPathFrom(current.pathname)}?${next}`);
    this.#cleanup();
  };

  #cleanup = () => {
    this.#tokens.forEach((token) => commitWaiter.endAsync(token));
    this.#tokens = [];
  };
}

/**
 * The REPL renders the same document at a few paths, and only `/edit` can
 * carry one in its URL.
 */
function editPathFrom(pathname: string) {
  if (pathname === '/' || pathname.startsWith('/docs')) return '/edit/';

  return pathname;
}

/**
 * On initial load there is no currentURL yet, because the first transition
 * has not completed. The router also omits the origin, and `new URL` needs one.
 */
function currentURL(router: RouterService) {
  let base: string | null | undefined = router.currentURL;

  if (macroCondition(isTesting())) {
    /**
     * Private API, but there is no public way to read the URL before the
     * first transition resolves.
     */
    base ??= (router as unknown as { location?: { path?: string } }).location?.path;
  }

  base ??= window.location.toString();

  if (!base.includes(window.origin)) {
    return window.origin + base;
  }

  return base;
}

function isSameQuery(a: URLSearchParams, b: URLSearchParams) {
  if (a.size !== b.size) return false;

  for (const [key, value] of a) {
    if (b.get(key) !== value) return false;
  }

  return true;
}

/**
 * Don't invoke a function if we try to invoke again within
 * the timeout.
 */
function makeDebounced(fu: () => void) {
  let timeout: number;

  function runner() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fu();
    }, DEBOUNCE_MS);
  }

  runner.clear = () => clearTimeout(timeout);

  return runner;
}
