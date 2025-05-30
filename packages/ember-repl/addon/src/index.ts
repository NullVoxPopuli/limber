export { compile } from './compile/compile.ts';
export { Compiled } from './compile/Compiled.ts';
export { invocationName, invocationOf, nameFor } from './compile/utils.ts';
export {
  default as CompilerService,
  getCompiler,
  default as Service,
} from './services/compiler.ts';
export { setup as setupCompiler } from './setup.ts';

// Public Types
export type {
  CompileResult,
  EvalImportMap,
  ModuleMap,
  ScopeMap,
  UnifiedPlugin,
} from './compile/types';
