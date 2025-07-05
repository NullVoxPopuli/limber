'use strict';
// https://github.com/emberjs/ember.js/blob/master/testem.browserstack.js

const FailureOnlyPerBrowserReporter = require('testem-failure-only-reporter/grouped-by-browser');

const BrowserStackLaunchers = {
  BS_Safari_Current: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: [
      '--os',
      'OS X',
      '--os_version',
      'Big Sur',
      '--browser',
      'safari',
      '--browser_version',
      'latest',
      '--timeout',
      '1000',
      '--url',
      '<url>',
      '--resolution',
      '1600x1200',
    ],
    protocol: 'browser',
  },
  BS_MS_Edge: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: [
      '--os',
      'Windows',
      '--os_version',
      '10',
      '--browser',
      'edge',
      '--browser_version',
      'latest',
      '--timeout',
      '1000',
      '--url',
      '<url>',
      '--resolution',
      '1440x900',
    ],
    protocol: 'browser',
  },
};

module.exports = {
  test_page: 'tests/index.html?hidepassed&hideskipped&timeout=60000',
  timeout: 1200,
  cwd: 'dist',
  reporter: FailureOnlyPerBrowserReporter,
  browser_start_timeout: 2000,
  browser_disconnect_timeout: 120,
  parallel: 4,
  disable_watching: true,
  launchers: BrowserStackLaunchers,
  launch_in_dev: [],
  launch_in_ci: Object.keys(BrowserStackLaunchers),
};
