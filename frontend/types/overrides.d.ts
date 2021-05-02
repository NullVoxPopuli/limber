import '@ember/component';

/**
  * Typed Ember is refraining from adding this because it's not *really* intended for
  * mainstream use
  */
declare module '@ember/component' {
  // https://github.com/glimmerjs/glimmer-vm/blob/1bc620be641d0748e643ce64592e7442d314e590/packages/%40glimmer/manager/lib/public/template.ts#L9
  export function setComponentTemplate(factory: TemplateFactory, obj: object): object;
}

