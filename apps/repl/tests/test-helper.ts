import { _backburner } from '@ember/runloop';
import {
  currentRouteName,
  currentURL,
  getSettledState,
  resetOnerror,
  setApplication,
  visit,
} from '@ember/test-helpers';
import { getPendingWaiterState } from '@ember/test-waiters';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { setupEmberOnerrorValidation, start as qunitStart } from 'ember-qunit';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { getGlobalConfig } from '@embroider/macros/src/addon/runtime';

import App from '@ember/application';
import Resolver from 'ember-resolver';
import { registry } from '#app/registry.ts';
import Router from '#app/router.ts';

Object.assign(window, {
  visit,
  getSettledState,
  getPendingWaiterState,
  currentURL,
  currentRouteName,
  snapshotTimers: (label?: string) => {
    console.debug(
      label ?? 'snapshotTimers',
      JSON.parse(
        JSON.stringify({
          settled: getSettledState(),
          waiters: getPendingWaiterState(),
        })
      )
    );
  },
});

export function start() {
  const macros = getGlobalConfig()['@embroider/macros'];

  if (macros) macros.isTesting = true;

  const testRegistry = {
    ...registry,
    'limber/router': class TestRouter extends Router {
      location = 'none' as const;
      rootURL = '/';
    },
  };

  _backburner.DEBUG = true;
  setApplication(
    class TestApp extends App {
      modulePrefix = 'limber';
      Resolver = Resolver.withModules(testRegistry);
    }.create({
      rootElement: '#ember-testing',
      autoboot: false,
    })
  );

  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  QUnit.moduleStart(({ name }) => console.group(name));
  QUnit.testStart(({ name }) => console.group(name));
  QUnit.testDone(() => console.groupEnd());
  QUnit.moduleDone(() => console.groupEnd());

  QUnit.testStart(() => {
    localStorage.clear();
  });
  QUnit.testDone(resetOnerror);

  qunitStart();
}
