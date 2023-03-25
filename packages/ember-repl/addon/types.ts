import type { availablePlugins, availablePresets, transform } from '@babel/standalone';

export interface CompileResult {
  component?: unknown;
  error?: Error;
  name: string;
}

export interface Babel {
  availablePlugins: typeof availablePlugins;
  availablePresets: typeof availablePresets;
  transform: typeof transform;
}

export type Options = {
  skypack?: boolean;
};

export type ExtraModules = Record<string, unknown>;
