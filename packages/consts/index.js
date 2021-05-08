'use strict';

const path = require('path');

const monorepoRoot = path.join(__dirname, '..', '..');
const nodeModulesRoot = path.join(monorepoRoot, 'node_modules');
const esBuildBrowserTargets = ['chrome80', 'firefox80'];

module.exports = {
  monorepoRoot,
  nodeModulesRoot,
  esBuildBrowserTargets,
};
