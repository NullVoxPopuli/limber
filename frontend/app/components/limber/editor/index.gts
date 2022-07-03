import { Shadowed } from 'limber/components/shadowed';
import service from 'limber/helpers/service';

import codemirror from './-code-mirror';
import monaco from './-monaco';
import State from './state';
import Loader from './loader';
import { LoadingError } from './loading-error';
import { Placeholder } from './placeholder';

import type { ModifierLike } from '@glint/template';
import type { TemplateOnlyComponent as TOC } from '@ember/component/template-only';


const Target: TOC<{
  Element: HTMLDivElement;
  Args: {
    editor: ModifierLike<{
      Args: {
        Positional: [string, (text: string) => void],
        Named: { setValue: (fn: (text: string) => void) => void }
      }
    }>
  }
}> = <template>
  {{#let (service 'editor') as |context|}}
    <Shadowed @omitStyles={{true}} class="border border-gray-900 overflow-hidden" ...attributes>
      <link rel="stylesheet" href="/monaco/editor.main.css">
      <link rel="stylesheet" href="/monaco/preconfigured.css">

      {{!-- template-lint-disable no-inline-styles --}}
      <div
        style="width: 100%; height: 100%;"
        {{@editor
          context.text
          context.updateText
          setValue=context.swapText
        }}
      >{{context.text}}</div>
    </Shadowed>
  {{/let}}
</template>;


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
