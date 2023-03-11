import 'ember-source/types';
import 'ember-source/types/preview';
import '@glint/environment-ember-loose';
import '@glint/environment-ember-loose/native-integration';

import type { HelperLike, ModifierLike } from '@glint/template';
import type Layout from 'tutorial/components/layout';

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    // How to define globals from external addons
    // state: HelperLike<{ Args: {}, Return: State }>;
    // attachShadow: ModifierLike<{ Args: { Positional: [State['update']]}}>;

    /**
     *  Components
     */
    Layout: typeof Layout;

    /**
     * Helpers
     */
    'page-title': HelperLike<{ Args: { Positional: [string] }; Return: string }>;

    /**
     * Modifiers
     */
  }
}
