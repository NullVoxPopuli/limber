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
import { start } from 'ember-qunit';

import Application from 'limber/app';
import config from 'limber/config/environment';

setApplication(Application.create(config.APP));

Object.assign(window, { getSettledState, getPendingWaiterState, currentURL, currentRouteName });

setup(QUnit.assert);

QUnit.testDone(resetOnerror);

start();
