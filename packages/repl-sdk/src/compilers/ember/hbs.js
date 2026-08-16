import { isRecord } from '../../utils.js';
import { makeOwner } from './owner.js';

let elementId = 0;

/**
 * @param {unknown} [ options ]
 * @returns {{ scope: Record<string, unknown> }}
 */
function filterOptions(options) {
  if (!isRecord(options)) {
    return { scope: {} };
  }

  return {
    scope: /** @type {Record<string, unknown>}*/ (options?.scope || {}),
  };
}

/**
 * @type {import('../../types.ts').CompilerConfig['compiler']}
 */
export async function compiler(config, api) {
  /**
   * @type {import('../../types.ts').Compiler}
   */
  const hbsCompiler = {
    compile: async (text, options) => {
      if (isRecord(options) && options.renderToString) {
        // Build-time form: emit a JS module that imports `template` from the
        // build-time template-compiler. The host app's content-tag/babel
        // pipeline will precompile the `template(...)` call to wire format.
        //
        // A runtime `scope` object can't be serialized into source, so the
        // standalone form emits an empty scope. When gmd inlines this module
        // into a parent that imports a live scope namespace, it passes that
        // namespace and the keys on it, and reading through it here is what
        // keeps a live codefence working with top-level scope.
        const templateModule =
          typeof options.inlineTemplateModule === 'string'
            ? options.inlineTemplateModule
            : '@ember/template-compiler';
        const scopeKeys = Array.isArray(options.inlineScopeKeys) ? options.inlineScopeKeys : [];
        const namespace =
          typeof options.inlineScopeNamespace === 'string' ? options.inlineScopeNamespace : null;
        const scopeBody =
          namespace && scopeKeys.length
            ? `{ ${scopeKeys.map((key) => `${key}: ${namespace}.${key}`).join(', ')} }`
            : `{}`;

        const source =
          `import { template } from '${templateModule}';\n` +
          `const _component = template(${JSON.stringify(text)}, { scope: () => (${scopeBody}) });\n` +
          `export default _component;\n`;

        return source;
      }

      const { template } = await api.tryResolve('@ember/template-compiler/runtime');

      const component = template(text, {
        scope: () => ({
          ...filterOptions(config).scope,
          ...filterOptions(options).scope,
        }),
      });

      /**
       * Some versions of ember implement the runtime template compiler incorrectly (albeit, correct enough for the constraints at the time).
       * So we need to wait longer than a microtask queue request could take.
       *
       * To make sure that the template is compiled, and "component"
       * has a value.
       *
       * See:
       * - https://github.com/emberjs/ember.js/issues/20913
       * - https://github.com/emberjs/ember.js/issues/20914
       */
      await new Promise(requestAnimationFrame);

      /**
       * Is this allowed here? or do I just return text,
       * and do the above in 'render'
       */
      return component;
    },
    render: async (element, compiled, extra, compiler) => {
      /**
       *
       * TODO: These will make things easier:
       *    https://github.com/emberjs/rfcs/pull/1099
       *    https://github.com/ember-cli/ember-addon-blueprint/blob/main/files/tests/test-helper.js
       */
      const attribute = `data-repl-sdk-ember-hbs-${elementId++}`;

      element.setAttribute(attribute, '');

      const { renderComponent } = await compiler.tryResolve('@ember/renderer');
      const owner = makeOwner(config.owner);
      const args = /** @type {Record<string, unknown> | undefined} */ (
        extra && typeof extra === 'object' && 'args' in extra
          ? /** @type {Record<string, unknown>} */ (extra).args
          : undefined
      );
      const result = renderComponent(compiled, {
        into: element,
        owner,
        ...(args ? { args } : {}),
      });

      compiler.announce('info', 'Ember Island Rendered');

      return () => result.destroy();
    },
  };

  return hbsCompiler;
}
