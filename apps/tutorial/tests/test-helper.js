import { setApplication } from '@ember/test-helpers';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';

import Application from 'tutorial/app';
import config from 'tutorial/config/environment';

setApplication(Application.create(config.APP));

// Fast test timeout, because I'm impatient
QUnit.config.testTimeout = 10_000;

setup(QUnit.assert);

start();
