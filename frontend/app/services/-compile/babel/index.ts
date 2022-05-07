import { compileJS as cjs } from 'ember-repl';
import config from 'limber/config/environment';

import { compile as worker } from './worker';

import type { AsyncReturnType } from 'type-fest';

type CompiledViaWorker = AsyncReturnType<typeof worker>;
type CompiledViaCJS = AsyncReturnType<typeof cjs>;
export type CompileOutput = CompiledViaCJS | CompiledViaWorker;

export async function compileJS(js: string): Promise<CompileOutput[]> {
  if (config.SERVICE_WORKER) {
    return worker(js);
  }

  return cjs(js);
}
