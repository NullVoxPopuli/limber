import type { TemplateMatch } from './parse-templates.ts';
import type { NodePath } from '@babel/traverse';
import type { CallExpression } from '@babel/types';
import type { ImportUtil } from 'babel-import-util';

// const Greeting = <template>Hello</template>
export const TEMPLATE_TAG_NAME = 'template';
export const TEMPLATE_TAG_PLACEHOLDER = '__GLIMMER_TEMPLATE';

export function isTemplateTag(callExpressionPath: NodePath<CallExpression>) {
  const callee = callExpressionPath.get('callee');

  return (
    !Array.isArray(callee) && callee.isIdentifier() && callee.node.name === TEMPLATE_TAG_PLACEHOLDER
  );
}

export function buildPrecompileTemplateCall(
  t: any,
  callExpressionPath: NodePath<CallExpression>,
  state: {
    importUtil: ImportUtil;
  }
): CallExpression {
  const callee = callExpressionPath.get('callee');

  return t.callExpression(
    state.importUtil.import(callee, '@ember/template-compilation', 'precompileTemplate'),
    callExpressionPath.node.arguments
  );
}

export function registerRefs(
  newPath: string | string[],
  getRefPaths: (path: string) => NodePath[]
) {
  if (Array.isArray(newPath)) {
    if (newPath.length > 1) {
      throw new Error(
        'registerRefs is only meant to handle single node transformations. Received more than one path node.'
      );
    }

    newPath = newPath[0] as string;
  }

  const refPaths = getRefPaths(newPath);

  for (const ref of refPaths) {
    if (!ref.isIdentifier()) {
      throw new Error(
        'ember-template-imports internal assumption that refPath should of type identifier. Please open an issue.'
      );
    }

    const binding = ref.scope.getBinding(ref.node.name);

    if (binding !== undefined) {
      binding.reference(ref);
    }
  }
}

const SUPPORTED_EXTENSIONS = ['.js', '.ts', '.gjs', '.gts'];

export function isSupportedScriptFileExtension(filePath: string) {
  return SUPPORTED_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}

export function isStrictMode(templateInfo: TemplateMatch): boolean {
  return templateInfo.type === 'template-tag';
}
