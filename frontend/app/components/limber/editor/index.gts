import codemirror from './-code-mirror';
import monaco from './-monaco';
import State from './state';
import Target from './target';
import Loader from './loader';
import { LoadingError } from './loading-error';
import { Placeholder } from './placeholder';

import type { TemplateOnlyComponent as TOC } from '@ember/component/template-only';

const isLoading = (a: boolean, b: boolean) => a || b;

const Editor: TOC<{
  Element: HTMLDivElement;
}> = <template>
  <State as |state|>

    {{#if (state.matches 'editingWithMonaco')}}

      <Target @editor={{monaco}} />

    {{else if (state.matches 'editingWithCodeMirror')}}

      <Target @editor={{codemirror}} class="overflow-y-auto" />

    {{else}}
      <div class="relative border border-gray-900 bg-gray-800" ...attributes>

        {{#if (isLoading (state.matches 'loadMonaco') (state.matches 'loadCodeMirror'))}}
          <Loader />
        {{/if}}

        {{#if (state.matches "error")}}
          <LoadingError @error={{state.context.error}} />
        {{/if}}

        <Placeholder />
      </div>
    {{/if}}

  </State>
</template>

export default Editor;