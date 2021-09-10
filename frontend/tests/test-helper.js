import { resetOnerror, setApplication } from '@ember/test-helpers';
import * as QUnit from 'qunit';
import { setup as setupDom } from 'qunit-dom';
import { start } from 'ember-qunit';

import Application from 'limber/app';
import config from 'limber/config/environment';

import { hideUpstreamErrors } from './-utils';

setApplication(Application.create(config.APP));

setupDom(QUnit.assert);
hideUpstreamErrors();

QUnit.testDone(resetOnerror);

start();
