import path from "node:path";
import assert from "node:assert";

import { execa } from "execa";
import { project } from "ember-apply";

/**
  * @param {{ target: string }} options
  */
export async function symlinkEverywhere(options) {
  let { target } = options;

  assert(target, `target for symlinkEverywhere was not defined`);

  let root = await project.workspaceRoot();
  
  let resolved = path.resolve(target);
  let fileName = path.basename(resolved);
  let relativeTo = path.relative(root, resolved);
  let isOutSideRepo= relativeTo.startsWith('..');

  assert(!isOutSideRepo, `file to symlink must be in the repo. Passed: ${target}, which resolved to ${resolved}, which is relative to the root: ${relativeTo}`);

  for await (let workspace of await project.eachWorkspace()) {
    if (workspace === root) continue;

    let relativeTo = path.relative(workspace, resolved);

    await execa('ln', ['-s', relativeTo, fileName], { cwd: workspace });
  }

}
