import {
  currentRouteName,
  currentURL,
  getSettledState,
  resetOnerror,
  setApplication,
} from '@ember/test-helpers';
import { getPendingWaiterState } from '@ember/test-waiters';
import EmberApp from '@ember/application';
import Resolver from 'ember-resolver';
import EmberRouter from '@ember/routing/router';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
