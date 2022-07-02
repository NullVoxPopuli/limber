/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { compileHBS, compileJS, invocationName } from 'ember-repl';
import CopyMenu from 'limber/components/limber/copy-menu';

import { parseMarkdown } from './markdown-to-ember';

import type { ExtractedCode } from './markdown-to-ember';
import type { CompileResult } from 'ember-repl';

interface CompilationResult {
  rootTemplate?: string;
  rootComponent?: unknown;
  scope?: object[];

  error?: Error;
  errorLine?: number;
}

export async function compileAll(js: { code: string }[]) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let { COMPONENT_MAP } = await import('/ember-repl/component-map.js');

  let modules = await Promise.all(
    js.map(async ({ code }) => {
      return await compileJS(code, COMPONENT_MAP);
    })
  );

  return modules;
}

export async function compile(glimdownInput: string): Promise<CompilationResult> {
  let rootTemplate: string;
  let liveCode: ExtractedCode[];
  let scope: CompileResult[] = [];

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
   * Make sure non of our snippets errored
   *
   * TODO: for these errors, report them differently so that we
   * can render the 'Ember' and still highlight the correct line?
   * or maybe there is a way to highlight in the editor instead?
   */
  for (let { error, component } of scope) {
    if (!component) {
      if (error) {
        return { error, rootTemplate };
      }
    }
  }

  /**
   * Step 4: Compile the Ember Template
   */
  try {
    let localScope = scope.reduce((accum, { component, name }) => {
      accum[invocationName(name)] = component;

      return accum;
    }, {} as Record<string, unknown>);

    let { component, error } = compileHBS(rootTemplate, {
      scope: { ...localScope, 'Limber::CopyMenu': CopyMenu },
    });

    return { rootTemplate, rootComponent: component, error };
  } catch (error) {
    return { error, rootTemplate };
  }
}
