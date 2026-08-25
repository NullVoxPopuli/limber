import { Installer } from './install.js';
import { getTar } from './npm-tar.js';
import { VFS } from './vfs.js';

/**
 * One fs per page, not one per Compiler.
 *
 * es-module-shims keys its module registry by URL globally, so a second
 * Compiler importing the same specifier gets the already-instantiated module
 * and its source hook is never called. A per-instance fs would look empty in
 * exactly that case, and the two would disagree about what is installed.
 */
export const vfs = new VFS();

export const installer = new Installer({ vfs, getTar });

export function clearFs() {
  vfs.clear();
  installer.clear();
}
