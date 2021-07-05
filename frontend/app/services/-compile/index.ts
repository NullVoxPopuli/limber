/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { compileHBS, compileJS } from 'ember-repl';

import { parseMarkdown } from './markdown-to-ember';

import type { ExtractedCode } from './markdown-to-ember';

interface CompilationResult {
  rootTemplate?: string;
  rootComponent?: object;
  scope?: object[];

  error?: Error;
  errorLine?: number;
}

export async function compileAll(js: { code: string }[]) {
  let modules = await Promise.all(
    js.map(async ({ code }) => {
      return await compileJS(code);
    })
  );

  return modules;
}

export async function compile(glimdownInput: string): Promise<CompilationResult> {
  let rootTemplate: string;
  let rootComponent: object;
  let liveCode: ExtractedCode[];
  let scope: object[] = [];

  /**
   * Step 1: Convert Markdown To HTML (Ember).
   *
   *         The remark plugin, remark-code-extra also extracts
   *         and transforms the code blocks we care about.
   *
   *         These blocks will be compiled through babel and eval'd so the
   *         compiled rootTemplate can invoke them
   */
  try {
    let { templateOnlyGlimdown, blocks } = await parseMarkdown(glimdownInput);

    rootTemplate = templateOnlyGlimdown;
    liveCode = blocks;
  } catch (error) {
    return { error };
  }

  /**
   * Step 2: Compile the live code samples
   */
  if (liveCode.length > 0) {
    try {
      let hbs = liveCode.filter((code) => code.lang === 'hbs');
      let js = liveCode.filter((code) => ['js', 'gjs'].includes(code.lang));

      if (js.length > 0) {
        let compiled = await compileAll(js);

        await Promise.all(
          compiled.map(async (info) => {
            // using web worker + import maps is not available yet (need firefox support)
            // (and to somehow be able to point at npm)
            //
            // if ('importPath' in info) {
            //   return scope.push({
            //     moduleName: name,
            //     component: await import(/* webpackIgnore: true */ info.importPath),
            //   });
            // }

            return scope.push(info);
          })
        );
      }

      for (let { code } of hbs) {
        scope.push(compileHBS(code));
      }
    } catch (error) {
      console.info({ scope });
      console.error(error);

      return { error, rootTemplate };
    }
  }

  /**
   * Step 4: Compile the Ember Template
   */
  try {
    rootComponent = compileHBS(rootTemplate, { scope });
  } catch (error) {
    return { error, rootTemplate };
  }

  return { rootTemplate, rootComponent };
}
