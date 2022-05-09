interface Info {
  name: string;
  code: string;
}

/**
 * Multi-phase "compiling"!
 *  1. Swap out imports from requireJS as const-definitions in the via
 *    `import { tracked } from '@glimmer/tracking';`
 *      -> const { tracked } = requirejs('@glimmer/tracking');
 *    `import Component from '@ember/component';`
 *      -> const { default: Component } = requirejs('@ember/component');
 *
 *     Outstanding question: where does '@glimmer/component' live?
 *     where would we get it from?
 *
 *  2. Run template transform
 *  3. Compile out the decorators
 *
 */
export function compileGJS({ name, code }: Info, requireJSList: Set<string>) {
  console.log(name, code, requireJSList);

  return ' ';
}
