// ember-content-mapper's request handlers, wired for the browser.
//
// The Node server reads the installed package versions with createRequire.
// Here the worker passes them in, read from the file system.

import { GlintEnvironment } from '@glint/ember-tsc/config/environment';
import { closeProject } from 'ember-content-mapper/lib/requests/close-project.js';
import { initialize } from 'ember-content-mapper/lib/requests/initialize.js';
import { transform } from 'ember-content-mapper/lib/requests/transform.js';
import { projects } from 'ember-content-mapper/lib/util/projects.js';
import { buildReferencePrefix } from 'ember-content-mapper/lib/util/references.js';

let versions = { emberSource: undefined, mapper: 'unknown', emberTsc: 'unknown' };

export function configure(next) {
  versions = next;
}

function openProject(params) {
  const options = params.options ?? {};
  const environment = GlintEnvironment.load(options);
  const referencePrefix = buildReferencePrefix(versions.emberSource);

  projects.set(params.projectHandle, { params, environment, referencePrefix });

  return {
    configIdentity: [
      `ember-content-mapper@${versions.mapper}`,
      `@glint/ember-tsc@${versions.emberTsc}`,
      `ember-source@${versions.emberSource ?? 'none'}`,
    ].join(';'),
  };
}

export const handlers = { initialize, openProject, transform, closeProject };
