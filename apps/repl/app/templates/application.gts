import { PortalTargets } from 'ember-primitives/components/portal-targets';
import Route from 'ember-route-template';

export default Route(
  <template>
    <PortalTargets />

    {{outlet}}
  </template>
);
