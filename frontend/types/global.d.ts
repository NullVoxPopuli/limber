// Types for compiled templates
declare module 'limber/templates/*' {
  import type { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

type Injections = Array<object | undefined>;

type LazyTrackedArgs = {
  positional?: Array<unknown>;
  named?: Record<string, unknown>;
}

declare module 'babel-plugin-htmlbars-inline-precompile';
declare module '@babel/plugin-proposal-decorators';
declare module '@glimmerx/babel-preset';
declare module '@ember/template-compilation';
declare module '@ember/template-factory';
declare module 'ember-source/dist/ember-template-compiler';
declare module '@glimmer/babel-preset';
declare module 'highlightjs-glimmer';
declare module 'highlightjs-glimmer/vendor/highlight.js';
declare module 'highlightjs-glimmer/vendor/javascript.min';
declare module 'split-grid';
declare module 'unist-util-flatmap';

declare module 'ember-could-get-used-to-this' {
  type FunctionModifier<Args extends LazyTrackedArgs> = (
    (element: HTMLElement,
     args: Args['positional'],
     namedArgs: Record<string, any>
    ) => () => void)
  | ((element: HTMLElement, args: Args['positional']) => void);

  export const use: PropertyDecorator;
  export const modifier: <Args extends LazyTrackedArgs>(
    callback: FunctionModifier<Args>
  ) => void;
  export class Modifier<Args extends LazyTrackedArgs = {}> {
    protected args: Args;
    protected element: Element;
  }
  export class Resource<Args extends LazyTrackedArgs> {
    protected args: Args;

    // This is a lie, but makes the call site nice
    constructor(fn: () => Args['positional'] | Args);
  }
}

declare module '@ember/template-compilation' {
  export interface CompileOptions {
    moduleName: string;
    strictMode: boolean;
    locals: Array<unknown>;
    isProduction: boolean;
    meta: Record<string, unknown>;
    plugins: {
      ast: Array<unknown>
    }
  }
  export function compileTemplate(template: string, options: CompileOptions): any;
}
