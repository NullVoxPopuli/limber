import Route from '@ember/routing/route';
import { service } from '@ember/service';

import { localStorageAdapter, Project, urlAdapter } from 'repl-sdk/project';

import { formatQPFrom } from '#app/languages.gts';

import { DEFAULT_SNIPPET } from 'limber/snippets';

import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';
import type EditorService from 'limber/services/editor';

/**
 * When embedding Limber, we want to force fully qualified
 * files either in the URL, or via iframe-message (postMessage)
 *
 * Trying to handle the scenario where the embedder isn't ready
 * to send us the document yet *and* still try to have a default
 * fallback causes Limber to do more work than needed, and can
 * cause content flashes.
 *
 * For example:
 * 1. Host page loads
 * 2. Limber starts loading in an iframe
 * 3. Limber starts rendering default content because non is specified
 *   (this is the step we're avoiding)
 * 4. Host sends Limber the document via postMessage
 * 5. Limber can now render that document
 */
export default class EditRoute extends Route {
  @service declare router: RouterService;
  @service declare editor: EditorService;

  /**
   * This route's only job is making the URL name a document. Everything
   * downstream reads the document back out of the URL, so the redirect is the
   * whole correction -- no writing state behind the transition's back.
   *
   * The transition still has to be aborted first. Calling replaceWith from
   * inside beforeModel of the transition being replaced crashes the router in
   * finalizeQueryParamChange, because /edit declares no query params.
   */
  async beforeModel(transition: Transition) {
    const qps = (transition.to?.queryParams ?? {}) as Record<string, string | undefined>;

    const hasCode = Boolean(qps.t || qps.c || qps.p);
    const hasFormat = qps.format !== undefined;
    const hasFileReference = Boolean(qps.file);

    /**
     * `file` is an instruction to go fetch a document, not a document. Once
     * it has been followed the URL carries the code, so drop it -- otherwise
     * every reload refetches and throws away whatever was typed since.
     */
    if (hasFileReference && hasFormat && !hasCode) {
      const response = await fetch(qps.file as string);
      const text = await response.text();

      return this.#redirect(
        transition,
        Project.single(text, { format: formatQPFrom(qps.format) }),
        {
          ...qps,
          file: undefined,
        }
      );
    }

    if (hasCode) {
      if (hasFormat) return;

      console.warn('URL contained no format SearchParam. Assuming glimdown');

      return this.#redirect(transition, this.editor.project.withFormat('gmd'), qps);
    }

    /**
     * Default starting doc is user-configurable.
     * (whatever they did last)
     */
    const stored = localStorageAdapter.parse();

    if (stored) {
      console.info(`Found a document in localStorage. Using that.`);

      return this.#redirect(transition, stored, qps);
    }

    console.warn(
      'URL contained no document information in the SearchParams. ' +
        'Assuming glimdown and using the default sample snippet.'
    );

    return this.#redirect(transition, Project.single(DEFAULT_SNIPPET, { format: 'gmd' }), qps);
  }

  async #redirect(
    transition: Transition,
    project: Project,
    qps: Record<string, string | undefined>
  ) {
    const params = urlAdapter.serialize(project, { into: viewParamsFrom(qps) });

    transition.abort();
    await Promise.resolve();

    return this.router.replaceWith(`/edit?${params}`);
  }
}

/**
 * Everything in the URL that isn't the document -- shadowdom, editorLoad, and
 * friends -- rides along through the redirect.
 */
function viewParamsFrom(qps: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(qps)) {
    if (value === undefined || value === null) continue;
    if (urlAdapter.OWNED_PARAMS.includes(key)) continue;

    params.set(key, String(value));
  }

  return params;
}
