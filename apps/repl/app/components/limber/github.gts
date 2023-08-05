import { on } from '@ember/modifier';

import { service } from 'ember-primitives';

import type EditorService from 'limber/services/editor';

function getAuth(editor: EditorService) {
  return editor.auth;
}

export const GitHubLogin = <template>
  {{#let (getAuth (service 'editor')) as |auth|}}
    {{#if auth.isPending}}
      ...
    {{else if auth.isAuthenticated}}
      Logged in
      <button {{on 'click' auth.logout}}>
        Logout
      </button>
    {{else}}
      <button {{on 'click' auth.login}}>
        Login with GitHub
      </button>
    {{/if}}
  {{/let}}
</template>;
