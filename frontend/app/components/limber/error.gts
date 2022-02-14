import Component from '@glimmer/component';
import { LinkTo } from '@ember/routing';
import { inject as service } from '@ember/service';

export default class EditorError extends Component {
  @service editor;
  @service router;

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
        {{#unless (this.router.isActive 'ember')}}
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

