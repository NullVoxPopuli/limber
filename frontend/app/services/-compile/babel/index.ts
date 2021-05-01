import config from 'limber/config/environment';

import { compile as cjs } from './cjs';
import { compile as worker } from './worker';

import type { ExtractedCode } from '../markdown-to-ember';
import type { AsyncReturnType } from 'type-fest';

type CompiledViaWorker = AsyncReturnType<typeof worker>;
type CompiledViaCJS = AsyncReturnType<typeof cjs>;
export type CompileOutput = CompiledViaCJS[0] | CompiledViaWorker[0];

export async function compileJS(_id: string, js: ExtractedCode[]): Promise<CompileOutput[]> {
  if (config.SERVICE_WORKER) {
    return worker(js);
  }

  return cjs(js);
}
