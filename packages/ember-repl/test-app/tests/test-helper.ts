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
import { start as qunitStart } from 'ember-qunit';

import Application from 'ember-repl-test-app/app';
import config from 'ember-repl-test-app/config/environment';

// skipped tests seem to mess up the nesting here
QUnit.moduleStart(({ name }) => console.group(name));
QUnit.testStart(({ name }) => console.group(name));
QUnit.testDone(() => console.groupEnd());
QUnit.moduleDone(() => console.groupEnd());

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

export function start() {
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);
  QUnit.testDone(resetOnerror);

  qunitStart();
}
