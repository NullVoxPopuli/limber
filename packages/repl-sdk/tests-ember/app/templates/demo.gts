import Component from '@glimmer/component';
import * as glimmerTracking from '@glimmer/tracking';

import * as babelMacros from 'babel-plugin-debug-macros';
import * as babelPluginETC from 'babel-plugin-ember-template-compilation';
import * as contentTag from 'content-tag';
import { modifier } from 'ember-modifier';
import * as templateCompiler from 'ember-source/dist/ember-template-compiler.js';
import { Compiler, defaults } from 'repl-sdk';

const compiler = new Compiler({
  ...defaults,
  logging: true,
  resolve: {
    '@babel/standalone': () => import('@babel/standalone'),
    'decorator-transforms': () => import('decorator-transforms'),
    // 'babel-plugin-ember-template-compilation': import(
    //   'babel-plugin-ember-template-compilation'
    // ),
    'babel-plugin-ember-template-compilation': babelPluginETC,
    'babel-plugin-debug-macros': babelMacros,
    // 'content-tag': () => import('content-tag'),
    'content-tag': contentTag,
    'ember-template-compiler': templateCompiler,
    'ember-source/dist/ember-template-compiler.js': templateCompiler,

    // Pass all the ember stuff through
    // TODO: check if we can do ember-source/dist/packages paths
    '@ember/component': () => import('@ember/component'),
    '@ember/modifier': () => import('@ember/modifier'),
    '@ember/helper': () => import('@ember/helper'),
    '@ember/template-factory': () => import('@ember/template-factory'),
    '@ember/template-compilation': () => import('@ember/template-compilation'),
    '@ember/component/template-only': () =>
      import('@ember/component/template-only'),
    '@glimmer/component': () => import('@glimmer/component'),
    // '@glimmer/tracking': () => import('@glimmer/tracking'),
    '@glimmer/tracking': glimmerTracking,
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
    const root = await compiler.compile('gjs', snippet, {});

    element.appendChild(root);
  })();
});

export class MiniRepl extends Component {
  <template>
    <div {{compile}}></div>
  </template>
}
