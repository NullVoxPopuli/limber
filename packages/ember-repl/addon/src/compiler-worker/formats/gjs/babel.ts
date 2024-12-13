import type { availablePlugins, availablePresets, transform } from '@babel/standalone';

export interface Babel {
  availablePlugins: typeof availablePlugins;
  availablePresets: typeof availablePresets;
  transform: typeof transform;
}
