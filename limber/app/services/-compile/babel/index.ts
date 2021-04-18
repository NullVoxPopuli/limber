import { SERVICE_WORKER } from 'limber/config/environment';

import { compile as cjs } from './cjs';
import { compile as worker } from './worker';

import type { ExtractedCode } from '../markdown-to-ember';

export async function compileJS(_id: string, js: ExtractedCode[]) {
  if (SERVICE_WORKER) {
    return worker(js);
  }

  return cjs(js);
}
