'use strict';

import { join } from 'node:path';

const { addonV1Shim } = require('@embroider/addon-shim');

module.exports = addonV1Shim(join(__dirname, '..'));
