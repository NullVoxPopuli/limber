import { getSettledState, resetOnerror, setApplication } from '@ember/test-helpers';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { start as qunitStart } from 'ember-qunit';

import Application from 'ember-repl-test-app/app';
import config from 'ember-repl-test-app/config/environment';

export function start() {
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);
  QUnit.testDone(resetOnerror);
  Object.assign(window, { getSettledState });

  qunitStart();
}
