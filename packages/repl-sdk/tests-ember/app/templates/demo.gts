import Component from '@glimmer/component';

import * as templateCompiler from 'ember-source/dist/ember-template-compiler.js';
import * as babelMacros from 'babel-plugin-debug-macros';

import { modifier } from 'ember-modifier';
import { Compiler, defaults } from 'repl-sdk';

let compiler = new Compiler({
  ...defaults,
  logging: true,
  resolve: {
    '@babel/standalone': () => import('@babel/standalone'),
    'decorator-transforms': () => import('decorator-transforms'),
    'babel-plugin-ember-template-compilation': import(
      'babel-plugin-ember-template-compilation'
    ),
    'babel-plugin-debug-macros': babelMacros,
    'content-tag': () => import('content-tag'),
    'ember-template-compiler': templateCompiler,
    'ember-source/dist/ember-template-compiler.js': templateCompiler,

    // Pass all the ember stuff through
    '@ember/component': () => import('@ember/component'),
    '@ember/modifier': () => import('@ember/modifier'),
    '@ember/helper': () => import('@ember/helper'),
    '@ember/template-factory': () => import('@ember/template-factory'),
    '@ember/template-compiler': () =>
      import('ember-source/dist/packages/@ember/template-compiler'),
    '@ember/component/template-only': () =>
      import('@ember/component/template-only'),
    '@glimmer/component': () => import('@glimmer/component'),
    '@glimmer/tracking': () => import('@glimmer/tracking'),
  },
});

const snippet = `
import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

const count = cell(0);
const increment = () => count.current++;

<template>
  <button {{on 'click' increment}}>{{count}}++</button>
</template>
`;

const compile = modifier((element) => {
  (async () => {
    let root = await compiler.compile('gjs', snippet, {});

    element.appendChild(root);
  })();
});

export class MiniRepl extends Component {
  <template>
    <div {{compile}}></div>
  </template>
}
