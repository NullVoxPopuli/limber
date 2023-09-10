import { notInIframe } from 'ember-primitives/iframe';
import Route from 'ember-route-template';

import Editor from 'limber/components/limber/editor';
import FrameOutput from 'limber/components/limber/frame-output';
import Guest from 'limber/components/limber/guest';
import Header from 'limber/components/limber/header';
import Help from 'limber/components/limber/help';
import Layout from 'limber/components/limber/layout';

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
          <FrameOutput />
        </:output>
      </Layout>

      <Help />
    </main>
  </template>
);
