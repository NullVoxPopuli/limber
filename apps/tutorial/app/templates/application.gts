import { pageTitle } from 'ember-page-title';
import Route from 'ember-route-template';
import Layout from 'tutorial/components/layout';

export default Route(
  <template>
    {{pageTitle "Glimmer tutorial"}}

    <Layout />
  </template>
);
