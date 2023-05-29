export interface EvalImportMap {
  [moduleName: string]: ScopeMap;
}

export interface ScopeMap {
  [localName: string]: unknown;
}
