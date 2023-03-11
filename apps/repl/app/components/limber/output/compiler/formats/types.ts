export interface CompilationResult {
  rootTemplate?: string;
  rootComponent?: unknown;
  scope?: object[];

  error?: Error;
  errorLine?: number;
}
