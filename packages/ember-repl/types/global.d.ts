/* eslint-disable @typescript-eslint/no-unused-vars */
// Types for compiled templates
// declare module 'ember-repl/templates/*' {
//   import type { TemplateFactory } from 'htmlbars-inline-precompile';
//   const tmpl: TemplateFactory;
//   export default tmpl;
// }


// provided by vendor/ember/ember-template-compiler.js (somehow)
declare module 'ember-template-compiler';

declare module '@ember/-internals/glimmer';
declare module '@ember/helper';
declare module '@ember/modifier';
declare module '@ember/template-factory';

/**
  * ember-cli-typescript does not provide types for glimmer...
  * ember-source does not provide types for glimmer...
  */
declare module '@glimmer/compiler' {
  import type {PrecompileOptions} from "ember-cli-htmlbars";
  export function precompileJSON(source: string, options: PrecompileOptions): [unknown, string[]]
}

declare module 'babel-plugin-htmlbars-inline-precompile';
declare module '@babel/plugin-proposal-decorators';

declare module '@ember/template-compilation' {
  export interface CompileOptions {
    moduleName: string;
    strictMode: boolean;
    locals?: Array<unknown>;
    scope: Record<string, unknown> | (() => Record<string, unknown>);
    isProduction?: boolean;
    meta?: Record<string, unknown>;
    // plugins: {
    //   ast: Array<unknown>
    // }
  }
  export function compileTemplate(template: string, options: CompileOptions): any;
}
