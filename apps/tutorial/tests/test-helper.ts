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

import Application from 'tutorial/app';
import config, { enterTestMode } from 'tutorial/config/environment';

export function start() {
  enterTestMode();
  setApplication(Application.create(config.APP));

  // Fast test timeout, because I'm impatient
  QUnit.config.testTimeout = 10_000;

  Object.assign(window, {
    getSettledState,
    getPendingWaiterState,
    currentURL,
    currentRouteName,
  });
  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  QUnit.testStart(() => {
    localStorage.clear();
  });
  QUnit.testDone(resetOnerror);
  qunitStart();
}
