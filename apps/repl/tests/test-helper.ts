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

import config, { enterTestMode } from '#config';

import Application from 'limber/app';

Object.assign(window, {
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
  enterTestMode();
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  QUnit.testStart(() => {
    localStorage.clear();
  });
  QUnit.testDone(resetOnerror);

  qunitStart();
}
