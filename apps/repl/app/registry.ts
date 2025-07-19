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
const autoRegistry = {
  ...formatAsResolverEntries(import.meta.glob('./services/**/*.{js,ts}', { eager: true })),
  ...formatAsResolverEntries(import.meta.glob('./routes/**/*.{js,ts}', { eager: true })),
  [`${appName}/router`]: Router,
};

import ApplicationController from './controllers/application.ts';
import ApplicationTemplate from './templates/application.gts';
import DocsTemplate from './templates/docs.gts';
import EditTemplate from './templates/edit.gts';
import OutputTemplate from './templates/output.gts';

export const registry = {
  // /////////////////
  // To Eliminate
  // /////////////////

  // Used by ember-container-query
  [`${appName}/services/resize-observer`]: await import(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    'ember-resize-observer-service/addon/services/resize-observer'
  ),

  // /////////////////
  // To keep
  // /////////////////
  [`${appName}/services/page-title`]: PageTitleService,
  ...autoRegistry,
  [`${appName}/controllers/application`]: ApplicationController,
  [`${appName}/templates/application`]: ApplicationTemplate,
  [`${appName}/templates/docs`]: DocsTemplate,
  [`${appName}/templates/edit`]: EditTemplate,
  [`${appName}/templates/output`]: OutputTemplate,
};
