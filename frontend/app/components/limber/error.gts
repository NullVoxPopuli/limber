import Component from '@glimmer/component';
import { LinkTo } from '@ember/routing';
import { inject as service } from '@ember/service';

import type EditorService from 'limber/services/editor';
import type RouterService from '@ember/routing/router-service';

interface Signature {
  Element: HTMLElement | null;
}

export default class EditorError extends Component<Signature> {
  @service declare editor: EditorService;
  @service declare router: RouterService;

  // see: https://github.com/emberjs/ember.js/pull/20017
  get isEmberRouteActive() {
    return this.router.isActive('ember');
  }

  <template>
    {{#if this.editor.error}}

      <footer
        data-test-error
        class="
          rounded fixed right-4 bottom-4 p-4
          bg-red-100 text-black shadow-md border border-red-700
          max-w-[60vw]
        "
      >
        {{!-- template-lint-disable simple-unless --}}
        {{#unless this.isEmberRouteActive}}
          Click
          <LinkTo @route="ember" class="underline hover:text-black">
            here to view the compiled markdown
          </LinkTo>

          <br>
        {{/unless}}

        <pre class="whitespace-pre-wrap">{{this.editor.error}}</pre>
      </footer>
    {{/if}}
  </template>
}

