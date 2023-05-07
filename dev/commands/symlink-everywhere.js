import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';

import { project } from 'ember-apply';

/**
 * @param {{ target: string, force?: boolean }} options
 */
export async function symlinkEverywhere(options) {
  let { target, force } = options;

  assert(target, `target for symlinkEverywhere was not defined`);

  let root = await project.workspaceRoot();

  let resolved = path.resolve(target);
  let fileName = path.basename(resolved);
  let relativeTo = path.relative(root, resolved);
  let isOutSideRepo = relativeTo.startsWith('..');

  assert(
    !isOutSideRepo,
    `file to symlink must be in the repo. Passed: ${target}, which resolved to ${resolved}, which is relative to the root: ${relativeTo}`
  );

  for await (let workspace of await project.eachWorkspace()) {
    if (workspace === root) continue;

    let newFile = path.join(workspace, fileName);
    let linkTarget = path.relative(workspace, resolved);

    if (await exists(newFile)) {
      if (!force) {
        continue;
      }

      await fs.rm(newFile);
    }

    await fs.symlink(linkTarget, fileName);
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
