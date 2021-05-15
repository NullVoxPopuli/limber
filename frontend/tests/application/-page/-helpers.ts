import { selector } from 'fractal-page-object';

import type { PageObject } from 'fractal-page-object';
import type { PageObjectClass } from 'fractal-page-object/dist/-private/types';

type Nested = PageObjectClass<PageObject>;

const _s = (name: string, nested?: Nested) => selector(`[data-test-${name}]`, nested);

export const s = _s as typeof selector;
