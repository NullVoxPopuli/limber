import { selector } from 'fractal-page-object';

import type { PageObject, PageObjectConstructor } from 'fractal-page-object';

type Nested = PageObjectConstructor<Element, PageObject>;

export const dt = (name: string) => `[data-test-${name}]`;

const _s = (name: string, nested?: Nested) => {
  if (nested) {
    return selector(dt(name), nested);
  }

  return selector(dt(name));
};

export const s = _s as typeof selector;
