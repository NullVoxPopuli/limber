'use strict';

const path = require('path');

const monorepoRoot = path.join(__dirname, '..', '..');
const nodeModulesRoot = path.join(monorepoRoot, 'node_modules');

module.exports = {
  monorepoRoot,
  nodeModulesRoot,
};
