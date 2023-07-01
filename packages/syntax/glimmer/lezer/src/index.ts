import { parser } from './syntax.grammar';

import type { LRParser } from '@lezer/lr';

export { configureNesting } from './content';

export const glimmerParser = parser as LRParser;
