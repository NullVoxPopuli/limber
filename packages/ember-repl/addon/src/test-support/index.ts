import { CACHE } from '../browser/compile/index.ts';

export function clearCompileCache() {
  CACHE.clear();
}
