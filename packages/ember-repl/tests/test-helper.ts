import EmberApp from '@ember/application';
import EmberRouter from '@ember/routing/router';
import {
  currentRouteName,
  currentURL,
  getSettledState,
  resetOnerror,
  setApplication,
} from '@ember/test-helpers';
import { getPendingWaiterState } from '@ember/test-waiters';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { setupEmberOnerrorValidation, start as qunitStart } from 'ember-qunit';

import Resolver from 'ember-resolver';

class Router extends EmberRouter {
  location = 'none';
  rootURL = '/';
}

class TestApp extends EmberApp {
  modulePrefix = 'test-app';
  Resolver = Resolver.withModules({
    'test-app/router': { default: Router },
    // add any custom services here
  });
}

Router.map(function () {});

Object.assign(window, {
  getSettledState,
  getPendingWaiterState,
  currentURL,
  currentRouteName,
  snapshotTimers: (label?: string) => {
    const result = JSON.parse(
      JSON.stringify({
        settled: getSettledState(),
        waiters: getPendingWaiterState(),
      })
    );

    console.debug(label ?? 'snapshotTimers', result);

    return result;
  },
});

// skipped tests seem to mess up the nesting here
QUnit.moduleStart(({ name }) => console.group(name));
QUnit.testStart(({ name }) => console.group(name));
QUnit.testDone(() => console.groupEnd());
QUnit.moduleDone(() => console.groupEnd());

export function start() {
  setApplication(
    TestApp.create({
      autoboot: false,
      rootElement: '#ember-testing',
    })
  );
  setup(QUnit.assert);
  QUnit.testDone(resetOnerror);
  setupEmberOnerrorValidation();
  qunitStart();
}
