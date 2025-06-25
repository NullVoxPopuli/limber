import { notInIframe } from 'ember-primitives/iframe';

import Output from '#components/output.gts';

import Editor from './edit/editor/index.gts';
import Guest from './edit/guest.gts';
import Header from './edit/header';
import Help from './edit/help.gts';
import Layout from './edit/layout/index.gts';

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
