import { PortalTargets } from 'ember-primitives';
import Route from 'ember-route-template';

export default Route(
  <template>
    <PortalTargets />

    {{outlet}}
  </template>
);
