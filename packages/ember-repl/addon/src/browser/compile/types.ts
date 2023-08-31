import { type Plugin } from 'unified';

export interface EvalImportMap {
  [moduleName: string]: ScopeMap;
}

export interface ScopeMap {
  [localName: string]: unknown;
}

export type UnifiedPlugin = Plugin; // Parameters<ReturnType<typeof unified>['use']>[0];
