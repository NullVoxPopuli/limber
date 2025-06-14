import { notInIframe } from 'ember-primitives/iframe';
import Route from 'ember-route-template';

import Editor from 'limber/components/limber/editor';
import Guest from 'limber/components/limber/guest';
import Header from 'limber/components/limber/header';
import Help from 'limber/components/limber/help';
import Layout from 'limber/components/limber/layout';
import Output from 'limber/components/limber/output';

export default Route(
  <template>
    <Guest />

    <main
      class="grid grid-flow-col h-screen max-h-screen grid {{if (notInIframe) 'grid-rows-editor'}} "
    >
      {{#if (notInIframe)}}
        <Header />
      {{/if}}

      <Layout>
        <:editor>
          <Editor />
        </:editor>

        <:output>
          <div class="h-full w-full">
            <Output />
          </div>
        </:output>
      </Layout>

      <Help />
    </main>
  </template>
);
