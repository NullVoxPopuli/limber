import { selector } from 'fractal-page-object';

import type { PageObject } from 'fractal-page-object';
import type { PageObjectClass } from 'fractal-page-object/dist/-private/types';

type Nested = PageObjectClass<PageObject>;

export const dt = (name: string) => `[data-test-${name}]`;

const _s = (name: string, nested?: Nested) => selector(dt(name), nested);

export const s = _s as typeof selector;
