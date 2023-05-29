export interface CompilationResult {
  rootTemplate?: string;
  rootComponent?: unknown;
  scope?: object[];

  error?: Error;
  errorLine?: number;
}

export interface EvalImportMap {
  [moduleName: string]: ScopeMap;
}

export interface ScopeMap {
  [localName: string]: unknown;
}
