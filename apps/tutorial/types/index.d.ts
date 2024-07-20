import 'ember-source/types';
import 'ember-source/types/preview';
import '@nullvoxpopuli/limber-untyped';
import 'ember-cached-decorator-polyfill';

import type Docs from 'tutorial/services/docs';
import type Selected from 'tutorial/services/selected';

declare module '@ember/service' {
  interface Registry {
    selected: Selected;
    docs: Docs;
  }
}
