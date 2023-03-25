import { getTemplateLocals } from '@glimmer/syntax';

import HTMLBars, { preprocessEmbeddedTemplates } from 'babel-plugin-htmlbars-inline-precompile';
import { modules } from 'ember-repl/known-modules';
import { precompile as precompileTemplate } from 'ember-template-compiler';

import { nameFor } from '../utils';

import type { ExtraModules } from '../types';
import type Component from '@glimmer/component';

export interface Info {
  code: string;
  name: string;
}

export async function compileJS(code: string, extraModules?: ExtraModules) {
  let name = nameFor(code);
  let component: undefined | unknown;
  let error: undefined | Error;

  try {
    let compiled = await compileGJS({ code: code, name });

    if (!compiled) {
      throw new Error(`Compiled output is missing`);
    }

    // NOTE: we cannot `eval` ESM
    compiled = proxyToSkypack(compiled, extraModules);
    component = await evalSnippet(compiled);
  } catch (e) {
    error = e;
  }

  return { name, component, error };
}

export function proxyToSkypack(code: string, extraModules?: ExtraModules) {
  let knownModules = [...Object.keys(extraModules || {}), ...Object.keys(modules)];
  let origin = location.origin;

  let result = code.replaceAll(/from ('|")([^"']+)('|")/g, (_, __, modulePath) => {
    if (knownModules.includes(modulePath)) {
      return `from '${origin}/${modulePath}'`;
    }

    return `from 'https://cdn.skypack.dev/${modulePath}'`;
  });

  return result;
}

async function evalSnippet(code: string) {
  let encodedJs = encodeURIComponent(code);
  let result = await import(
    /* webpackIgnore: true */ `data:text/javascript;charset=utf-8,${encodedJs}`
  );

  if (!result.default) {
    throw new Error(`Expected module to have a default export, found ${Object.keys(result)}`);
  }

  return result as {
    default: Component;
    services?: { [key: string]: unknown };
  };
}

async function compileGJS({ code: input, name }: Info) {
  let babel = await import('@babel/standalone');

  let preprocessed = preprocessEmbeddedTemplates(input, {
    getTemplateLocals,
    relativePath: `${name}.js`,
    includeSourceMaps: false,
    includeTemplateTokens: true,
    templateTag: 'template',
    templateTagReplacement: 'GLIMMER_TEMPLATE',
    getTemplateLocalsExportPath: 'getTemplateLocals',
  });

  let result = babel.transform(preprocessed.output, {
    filename: `${name}.js`,
    plugins: [
      [
        HTMLBars,
        {
          precompile: precompileTemplate,
          // this needs to be true until Ember 3.27+
          ensureModuleApiPolyfill: false,
          modules: {
            'ember-template-imports': {
              export: 'hbs',
              useTemplateLiteralProposalSemantics: 1,
            },

            'TEMPLATE-TAG-MODULE': {
              export: 'GLIMMER_TEMPLATE',
              debugName: '<template>',
              useTemplateTagProposalSemantics: 1,
            },
          },
        },
      ],
      [babel.availablePlugins['proposal-decorators'], { legacy: true }],
      [babel.availablePlugins['proposal-class-properties']],
    ],
    presets: [
      [
        babel.availablePresets['env'],
        {
          // false -- keeps ES Modules...
          // it means "compile modules to this: ..."
          modules: false,
          targets: { esmodules: true },
          loose: true,
          forceAllTransforms: false,
        },
      ],
    ],
  });

  if (!result) {
    return;
  }

  let { code } = result;

  return code;
}
