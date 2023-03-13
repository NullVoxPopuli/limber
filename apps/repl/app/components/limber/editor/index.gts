import service from 'limber/helpers/service';

import codemirror from './-code-mirror';
import State from './state';
import Loader from './loader';
import { LoadingError } from './loading-error';
import { Placeholder } from './placeholder';

import type { TOC } from '@ember/component/template-only';

const Editor: TOC<{
  Element: HTMLDivElement;
}> = <template>
  <State as |state|>

    {{#if (state.matches 'editingWithCodeMirror')}}

      {{#let (service 'editor') as |context|}}
        <div class='overflow-hidden overflow-y-auto'>
          {{! template-lint-disable no-inline-styles }}
          <div
            style='width: 100%; height: 100%;'
            {{! @glint-ignore }}
            {{codemirror context.text context.format}}
          >{{context.text}}</div>
        </div>
      {{/let}}

    {{else}}
      <div
        class='syntax-dark relative border border-gray-900 bg-code-bg overflow-hidden'
        ...attributes
      >

        {{#if (state.matches 'loadCodeMirror')}}
          <Loader />
        {{/if}}

        {{#if (state.matches 'error')}}
          <LoadingError @error={{state.context.error}} />
        {{/if}}

        <Placeholder />
      </div>
    {{/if}}

  </State>
</template>

export default Editor;
