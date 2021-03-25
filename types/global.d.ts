// Types for compiled templates
declare module 'limber/templates/*' {
  import type { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

type LazyTrackedArgs = {
  positional?: Array<unknown>;
  named?: Record<string, unknown>;
}

declare module 'ember-could-get-used-to-this' {
  export const use: PropertyDecorator;
  export const modifier: <Args extends LazyTrackedArgs>(
    callback: (element: HTMLElement, args: Args['positional']) => () => void
  ) => void;
  export class Resource<Args extends LazyTrackedArgs> {
    protected args: Args;

    // This is a lie, but makes the call site nice
    constructor(fn: () => Args['positional'] | Args);
  }
}
