import { waitForPromise } from '@ember/test-waiters';

import { service } from 'ember-primitives/helpers/service';
import { resource, resourceFactory } from 'ember-resources';
import { TrackedObject } from 'tracked-built-ins';

import codemirror, { setupCodeMirror } from './-code-mirror';
import Loader from './loader';
import { LoadingError } from './loading-error';
import { Placeholder } from './placeholder';

import type { TOC } from '@ember/component/template-only';

function deferCodemirror() {
  const state = new TrackedObject({ isLoading: false, isDone: false, error: null });

  function getEditor() {
    state.isLoading = true;
    waitForPromise(setupCodeMirror())
      .then(() => {
        state.isDone = true;
      })
      .catch((error) => (state.error = error))
      .finally(() => {
        state.isLoading = false;
      });
  }

  function cleanup() {
    window.removeEventListener('mousemove', load);
    window.removeEventListener('keydown', load);
    window.removeEventListener('touchstart', load);
  }

  const load = () => {
    getEditor();
    cleanup();
  };

  return resource(({ on, owner }) => {
    if (owner.lookup('service:router').currentRoute?.queryParams?.['forceEditor'] === 'true') {
      load();
    }

    on.cleanup(() => cleanup());

    window.addEventListener('mousemove', load, { passive: true });
    window.addEventListener('keydown', load, { passive: true });
    window.addEventListener('touchstart', load, { passive: true });

    return state;
  });
}

resourceFactory(deferCodemirror);

export const Editor: TOC<{
  Element: HTMLDivElement;
}> = <template>
  {{#let (deferCodemirror) as |state|}}

    {{#if state.isDone}}

      {{#let (service "editor") as |context|}}
        <div class="overflow-hidden overflow-y-auto">
          {{! template-lint-disable no-inline-styles }}
          <div style="width: 100%; height: 100%;" {{codemirror}}>{{context.text}}</div>
        </div>
      {{/let}}

    {{else}}
      <div
        class="syntax-dark bg-code-bg relative overflow-hidden border border-gray-900"
        ...attributes
      >

        {{#if state.isLoading}}
          <Loader />
        {{/if}}

        {{#if state.error}}
          <LoadingError @error={{state.error}} />
        {{/if}}

        <Placeholder />
      </div>
    {{/if}}

  {{/let}}
</template>;

export default Editor;
