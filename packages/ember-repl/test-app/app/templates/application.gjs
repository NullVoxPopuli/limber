import Component from '@glimmer/component';

import * as babelStandalone from '@babel/standalone';
import * as decoratorTransforms from 'decorator-transforms';
import * as babelPluginEmberTemplateCompilation from 'babel-plugin-ember-template-compilation';
import * as contentTag from 'content-tag';
import { importSync } from '@embroider/macros';
// import * as templateCompiler from 'ember-source/dist/ember-template-compiler';
const templateCompiler = importSync('ember-source/dist/ember-template-compiler');

import { modifier } from 'ember-modifier';
import Route from 'ember-route-template';
import { Compiler, defaults } from "repl-sdk";

let compiler = new Compiler({
  ...defaults,
  logging: true,
  resolve: {
    '@babel/standalone': babelStandalone,
    'decorator-transforms': decoratorTransforms,
    'babel-plugin-ember-template-compilation': babelPluginEmberTemplateCompilation,
    'content-tag': contentTag,
    'ember-template-compiler': templateCompiler,
  }
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
  })()
});

class MiniRepl extends Component {
  <template>
    <div {{compile}}></div>
  </template>
}


export default Route(<template>
  <MiniRepl />
</template>);
