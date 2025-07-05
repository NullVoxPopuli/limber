'use strict';

const { join } = require('path');

const { addonV1Shim } = require('@embroider/addon-shim');

module.exports = addonV1Shim(join(__dirname, '..'));
