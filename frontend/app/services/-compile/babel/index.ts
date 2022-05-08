import { compileJS as cjs } from 'ember-repl';
// import config from 'limber/config/environment';

import { compile as worker } from './worker';

import type { AsyncReturnType } from 'type-fest';
import { ExtractedCode } from '../markdown-to-ember';

type CompiledViaWorker = AsyncReturnType<typeof worker>;
type CompiledViaCJS = AsyncReturnType<typeof cjs>;
export type CompileOutput = CompiledViaCJS | CompiledViaWorker;

export async function compileJS(info: ExtractedCode): Promise<CompileOutput> {
  // if (config.SERVICE_WORKER) {
  return worker(info);
  // }

  // return cjs(js);
}
