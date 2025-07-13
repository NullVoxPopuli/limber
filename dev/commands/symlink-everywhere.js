import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';

import { project } from 'ember-apply';

/**
 * @param {{ target: string, force?: boolean }} options
 */
export async function symlinkEverywhere(options) {
  const { target, force } = options;

  assert(target, `target for symlinkEverywhere was not defined`);

  const root = await project.workspaceRoot();

  const resolved = path.resolve(target);
  const fileName = path.basename(resolved);
  const relativeTo = path.relative(root, resolved);
  const isOutSideRepo = relativeTo.startsWith('..');

  assert(
    !isOutSideRepo,
    `file to symlink must be in the repo. Passed: ${target}, which resolved to ${resolved}, which is relative to the root: ${relativeTo}`
  );

  for await (const workspace of await project.eachWorkspace()) {
    if (workspace === root) continue;

    const newFile = path.join(workspace, fileName);
    const linkTarget = path.relative(workspace, resolved);

    if (await exists(newFile)) {
      if (!force) {
        continue;
      }

      await fs.rm(newFile);
    }

    try {
      await fs.symlink(linkTarget, fileName);
    } catch (e) {
      console.error(e);
      console.error(`Error: ${newFile}`);
    }
  }
}

async function exists(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    }

    throw e;
  }
}
