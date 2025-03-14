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

import Application from 'limber/app';
import config, { enterTestMode } from 'limber/config/environment';

export function start() {
  enterTestMode();
  setApplication(Application.create(config.APP));

  Object.assign(window, { getSettledState, getPendingWaiterState, currentURL, currentRouteName });

  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  QUnit.testStart(() => {
    localStorage.clear();
  });
  QUnit.testDone(resetOnerror);

  qunitStart();
}
