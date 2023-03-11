import { selector } from 'fractal-page-object';

import type { PageObject, PageObjectConstructor } from 'fractal-page-object';

type Nested = PageObjectConstructor<PageObject>;

export const dt = (name: string) => `[data-test-${name}]`;

const _s = (name: string, nested?: Nested) => selector(dt(name), nested);

export const s = _s as typeof selector;
