import { resource, resourceFactory } from 'ember-resources';

import type StatusService from '#app/services/status.ts';

export function clearError(_invalidator: unknown) {
  return resource(({ owner }) => {
    const status = owner.lookup('service:status') as StatusService;

    status?.hideError();

    return '';
  });
}

resourceFactory(clearError);
