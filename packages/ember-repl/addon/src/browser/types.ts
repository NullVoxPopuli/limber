import type { availablePlugins, availablePresets, transform } from '@babel/standalone';
import type { ComponentLike } from '@glint/template';

export interface CompileResult {
  component?: ComponentLike;
  error?: Error;
  name: string;
}

export interface Babel {
  availablePlugins: typeof availablePlugins;
  availablePresets: typeof availablePresets;
  transform: typeof transform;
}

export type Options = {
  /**
   * @internal
   * @deprecated do not use - not under semver
   */
  skypack?: boolean;
};

export type ExtraModules = Record<string, unknown>;
