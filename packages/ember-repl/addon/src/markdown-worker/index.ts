import { parseMarkdown } from './markdown.ts';

import type { CompileResult, EvalImportMap, ScopeMap, UnifiedPlugin } from '../types.ts';
import type { ExtractedCode } from './markdown.ts';

export async function compileGDM(
  glimdownInput: string,
  options?: {
    importMap?: EvalImportMap;
    topLevelScope?: ScopeMap;
    remarkPlugins?: UnifiedPlugin[];
    rehypePlugins?: UnifiedPlugin[];
    CopyComponent?: string;
    ShadowComponent?: string;
  }
): Promise<CompileResult & { rootTemplate?: string }> {
  let topLevelScope = options?.topLevelScope ?? {};
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
    let { templateOnlyGlimdown, blocks } = await parseMarkdown(glimdownInput, {
      CopyComponent: options?.CopyComponent,
      ShadowComponent: options?.ShadowComponent,
      remarkPlugins: options?.remarkPlugins,
      rehypePlugins: options?.rehypePlugins,
    });

    rootTemplate = templateOnlyGlimdown;
    liveCode = blocks;
  } catch (error) {
    return { error: error as Error, name: 'unknown' };
  }

  /**
   * Step 2: Compile the live code samples
   */
  if (liveCode.length > 0) {
    try {
      scope = await extractScope(liveCode, options);
    } catch (error) {
      console.info({ scope });
      console.error(error);

      return { error: error as Error, rootTemplate, name: 'unknown' };
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
        return { error, rootTemplate, name: 'unknown' };
      }
    }
  }

  /**
   * Step 4: Compile the Ember Template
   */
  try {
    let localScope = scope.reduce(
      (accum, { component, name }) => {
        accum[invocationName(name)] = component;

        return accum;
      },
      {} as Record<string, unknown>
    );

    return await compileHBS(rootTemplate, {
      moduleName: 'DynamicRootTemplate',
      scope: {
        ...topLevelScope,
        ...localScope,
      },
    });
  } catch (error) {
    return { error: error as Error, rootTemplate, name: 'unknown' };
  }
}

async function compileGJSArray(js: { code: string }[], importMap?: EvalImportMap) {
  let modules = await Promise.all(
    js.map(async ({ code }) => {
      // return await compileGJS(code, importMap);
    })
  );

  return modules;
}

async function extractScope(
  liveCode: ExtractedCode[],
  options?: {
    importMap?: EvalImportMap;
    topLevelScope?: ScopeMap;
  }
): Promise<CompileResult[]> {
  let scope: CompileResult[] = [];

  let hbs = liveCode.filter((code) => code.lang === 'hbs');
  let js = liveCode.filter((code) => ['js', 'gjs'].includes(code.lang));

  if (js.length > 0) {
    let compiled = await compileGJSArray(js, options?.importMap);

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
    let compiled = await compileHBS(code, { scope: options?.topLevelScope });

    scope.push(compiled);
  }

  return scope;
}
