import { getCompiler } from 'ember-repl';
import { describe, expect, test } from 'vitest';

/**
 * `compile` loads the module that it compiled, and that needs a Worker
 * and es-module-shims. Node has neither, so `compile` rejects there.
 *
 * A page that compiles at runtime can not pre-render until these pass.
 * `test.fails` goes red when they do, as the signal to remove it.
 */
describe('compile in node', () => {
  test.fails('gjs', async () => {
    const result = await getCompiler({}).compile(
      'gjs',
      `<template><output>hello</output></template>`
    );

    expect(result.error).toBeUndefined();
    expect(result.component).toBeDefined();
  });

  test.fails('markdown with a demo', async () => {
    const result = await getCompiler({}).compile(
      'gmd',
      ['# Title', '', '```gjs live', '<template>demo</template>', '```'].join(
        '\n'
      )
    );

    expect(result.error).toBeUndefined();
    expect(result.component).toBeDefined();
  });
});
