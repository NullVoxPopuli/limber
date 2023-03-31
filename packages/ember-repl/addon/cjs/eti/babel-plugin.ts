import { ImportUtil } from 'babel-import-util';

import { transformTemplateTag } from './template-tag-transform';
import * as util from './util';

import type { NodePath } from '@babel/traverse';
import type { CallExpression, Class, Program } from '@babel/types';

/**
 * This Babel plugin takes parseable code emitted by the string-based
 * preprocessor plugin in this package and converts it into calls to
 * the standardized `precompileTemplate` macro from `@ember/template-compilation`.
 *
 * Its goal is to convert code like this:
 *
 * ```js
 * import { hbs } from 'ember-template-imports';
 *
 * const A = hbs(`A`, {...});
 * const B = [__GLIMMER_TEMPLATE(`B`, {...})];
 * class C {
 *   template = hbs(`C`, {...});
 * }
 *
 * [__GLIMMER_TEMPLATE(`default`, {...})];
 *
 * class D {
 *   [__GLIMMER_TEMPLATE(`D`, {...})]
 * }
 * ```
 *
 * Into this:
 *
 * ```js
 * import { precompileTemplate } from '@ember/template-compilation';
 * import { setComponentTemplate } from '@ember/component';
 * import templateOnlyComponent from '@ember/component/template-only';
 *
 * const A = setComponentTemplate(
 *   precompileTemplate(`A`, {...}),
 *   templateOnlyComponent('this-module.js', 'A')
 * );
 * const B = setComponentTemplate(
 *   precompileTemplate(`B`, {...}),
 *   templateOnlyComponent('this-module.js', 'B')
 * );
 * class C {}
 * setComponentTemplate(precompileTemplate(`C`, {...}), C);
 *
 * export default setComponentTemplate(
 *   precompileTemplate(`default`, {...}),
 *   templateOnlyComponent('this-module.js', '_thisModule')
 * );
 *
 * class D {}
 * setComponentTemplate(precompileTemplate(`D`, {...}), D);
 * ```
 */
export default function (babel: any) {
  let t = babel.types;
  let visitor: any = {
    Program: {
      enter(path: NodePath<Program>, state: any) {
        state.importUtil = new ImportUtil(t, path);
      },
    },

    // Process class bodies before things like class properties get transformed
    // into imperative constructor code that we can't recognize. Taken directly
    // from babel-plugin-htmlbars-inline-precompile https://git.io/JMi1G
    Class(path: NodePath<Class>, state: any) {
      let bodyPath = path.get('body.body');

      if (!Array.isArray(bodyPath)) return;

      bodyPath.forEach((path) => {
        if (path.type !== 'ClassProperty') return;

        let keyPath = path.get('key');
        let valuePath = path.get('value');

        if (Array.isArray(keyPath)) return;

        if (keyPath && visitor[keyPath.type]) {
          visitor[keyPath.type](keyPath, state);
        }

        if (Array.isArray(valuePath)) return;

        if (valuePath && visitor[valuePath.type]) {
          visitor[valuePath.type](valuePath, state);
        }
      });
    },

    CallExpression(path: NodePath<CallExpression>, state: any) {
      if (util.isTemplateTag(path)) {
        transformTemplateTag(t, path, state);
      }
    },
  };

  return { visitor };
}
