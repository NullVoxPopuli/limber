import compatModules from '@embroider/virtual/compat-modules';

import PageTitleService from 'ember-page-title/services/page-title';

// Can't import this until it's a v2 addon (without compat support, that is)
// import ResizeService from 'ember-resize-observer-service/services/resize-observer';
import Router from './router.ts';

const appName = 'limber';

function formatAsResolverEntries(imports: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(imports).map(([k, v]) => [
      k.replace(/\.g?(j|t)s$/, '').replace(/^\.\//, `${appName}/`),
      v,
    ])
  );
}

/**
 * A global registry is needed until:
 * - Services can be referenced via import paths (rather than strings)
 * - we design a new routing system
 */
const resolverRegistry = {
  ...formatAsResolverEntries(import.meta.glob('./templates/**/*.{gjs,gts,js,ts}', { eager: true })),
  ...formatAsResolverEntries(import.meta.glob('./services/**/*.{js,ts}', { eager: true })),
  ...formatAsResolverEntries(import.meta.glob('./routes/**/*.{js,ts}', { eager: true })),
  [`${appName}/router`]: Router,
};

export const registry = {
  ...compatModules,
  // [`${appName}/services/resize-observer`]: ResizeService,
  [`${appName}/services/page-title`]: PageTitleService,
  ...resolverRegistry,
};
