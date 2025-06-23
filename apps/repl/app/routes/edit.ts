import Route from '@ember/routing/route';
import { service } from '@ember/service';

import { formatQPFrom } from '#app/languages.gts';

import { DEFAULT_SNIPPET } from 'limber/snippets';
import { getStoredDocument } from 'limber/utils/editor-text';

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

  async beforeModel(transition: Transition) {
    const qps = transition.to?.queryParams ?? {};

    const hasCode = Boolean(qps.t || qps.c);
    const hasFormat = qps.format !== undefined;

    if (!hasCode) {
      /**
       * Default starting doc is
       * user-configurable.
       * (whatever they did last)
       */
      const { format, doc } = getStoredDocument();

      if (format && doc) {
        console.info(`Found format and document in localStorage. Using those.`);
        transition.abort();
        this.editor.fileURIComponent.set(doc, formatQPFrom(format));

        return;
      }

      console.warn(
        'URL contained no document information in the SearchParams. ' +
          'Assuming glimdown and using the default sample snippet.'
      );

      transition.abort();
      this.editor.fileURIComponent.set(DEFAULT_SNIPPET, 'gmd');
    } else if (!hasFormat) {
      console.warn('URL contained no format SearchParam. Assuming glimdown');

      transition.abort();
      this.editor.fileURIComponent.forceFormat('gmd');
    }

    // By the time execution gets here, we'll either:
    // - already have the required queryParams, and everything is skipped
    // - be transitioning to an URL with the queryParams
  }
}
