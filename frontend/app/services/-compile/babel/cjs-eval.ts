/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * We need to import and hang on to these references so that they
 * don't get optimized away during deploy
 */
import Ember from 'ember';
import _Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { setComponentTemplate } from '@ember/component';
import _TO from '@ember/component/template-only';
import * as _helpers from '@ember/helper';
import { createTemplateFactory } from '@ember/template-factory';

import type Component from '@glimmer/component';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _Ember = Ember as any;

const modules = {
  '@ember/component': { setComponentTemplate },
  '@ember/template-factory': { createTemplateFactory },
  '@glimmer/component': _Component,
  '@ember/component/template-only': _TO,
  '@glimmer/tracking': { tracked },
  '@ember/modifier': { on: _Ember._on },
  '@ember/helper': _helpers,
};

// https://github.com/glimmerjs/glimmer-experimental/blob/master/packages/examples/playground/src/utils/eval-snippet.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function require(moduleName: keyof typeof modules): unknown {
  return modules[moduleName];
}

export function evalSnippet(
  compiled: string
): { default: Component; services?: { [key: string]: unknown } } {
  const exports = {};

  eval(compiled);

  return exports as { default: Component; services?: { [key: string]: unknown } };
}
