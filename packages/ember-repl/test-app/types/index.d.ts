import 'ember-source/types';
import '@glint/environment-ember-loose';
import '@nullvoxpopuli/limber-untyped';

// provided by vendor/ember/ember-template-compiler.js (somehow)
declare module '@glimmer/syntax' {
  export function getTemplateLocals(template: string): string[];
}
