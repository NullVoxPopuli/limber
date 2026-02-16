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
};

declare module '@sentry/ember';
declare module '@babel/plugin-proposal-decorators';
declare module 'split-grid';
declare module 'unist-util-flatmap';

declare module '@ember/template-compilation' {
  export interface CompileOptions {
    moduleName: string;
    strictMode: boolean;
    locals: Array<unknown>;
    isProduction: boolean;
    meta: Record<string, unknown>;
    plugins: {
      ast: Array<unknown>;
    };
  }
  export function compileTemplate(template: string, options: CompileOptions): any;
}
