export { compile, Compiled } from './compile/index.ts';
export { invocationName, invocationOf, nameFor } from './compile/utils.ts';
export { default as CompilerService, default as Service } from './services/compiler.ts';
export { setup as setupCompiler } from './setup.ts';

// Public Types
export type {
  CompileResult,
  EvalImportMap,
  ModuleMap,
  ScopeMap,
  UnifiedPlugin,
} from './compile/types';
