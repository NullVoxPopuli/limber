import { CACHE } from '../compile/index.ts';

export function clearCompileCache() {
  CACHE.clear();
}
