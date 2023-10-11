/**
 * We need to import and hang on to these references so that they
 * don't get optimized away during deploy
 */
import _GlimmerComponent from '@glimmer/component';
import * as _tracking from '@glimmer/tracking';
import * as _application from '@ember/application';
import * as _array from '@ember/array';
import * as _EmberComponent from '@ember/component';
import _TO from '@ember/component/template-only';
import * as _debug from '@ember/debug';
import * as _destroyable from '@ember/destroyable';
import * as _helpers from '@ember/helper';
import * as _modifier from '@ember/modifier';
import * as _object from '@ember/object';
import * as _owner from '@ember/owner';
import * as _runloop from '@ember/runloop';
import * as _service from '@ember/service';
import * as _template from '@ember/template';
import * as _trackingPrimitivesCache from '@glimmer/tracking/primitives/cache';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createTemplateFactory } from '@ember/template-factory';
import * as _utils from '@ember/utils';

export const modules = {
  '@ember/application': _application,
  '@ember/array': _array,
  '@ember/component': _EmberComponent,
  '@ember/component/template-only': _TO,
  '@ember/debug': _debug,
  '@ember/destroyable': _destroyable,
  '@ember/helper': _helpers,
  '@ember/modifier': _modifier,
  '@ember/object': _object,
  '@ember/runloop': _runloop,
  '@ember/service': _service,
  '@ember/template-factory': { createTemplateFactory },
  '@ember/utils': _utils,
  '@ember/template': _template,
  '@ember/owner': _owner,

  '@glimmer/component': _GlimmerComponent,
  '@glimmer/tracking': _tracking,
  '@glimmer/tracking/primitives/cache': _trackingPrimitivesCache,
};
