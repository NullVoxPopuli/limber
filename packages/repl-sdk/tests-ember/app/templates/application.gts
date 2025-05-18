import { pageTitle } from 'ember-page-title';
import Route from 'ember-route-template';

import { MiniRepl } from './demo';

export default Route(
  <template>
    {{pageTitle "TestsEmber"}}

    {{outlet}}

    <MiniRepl />
  </template>
);
