import 'ember-source/types';
import 'ember-source/types/preview';
import '@glint/environment-ember-loose';
import '@nullvoxpopuli/limber-untyped';

import { htmlSafe } from '@ember/template';

declare module '@glint/environment-ember-loose/registry' {
  // Remove this once entries have been added! 👇
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export default interface Registry {
    htmlSafe: typeof htmlSafe;
    // Add any registry entries from other addons here that your addon itself uses (in non-strict mode templates)
    // See https://typed-ember.gitbook.io/glint/using-glint/ember/using-addons
  }
}
