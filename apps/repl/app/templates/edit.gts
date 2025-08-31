import Component from '@glimmer/component';
import { service } from '@ember/service';

import { notInIframe } from 'ember-primitives/iframe';

import Output from '#components/output.gts';

import { ExternalLink as Link } from 'limber-ui';

import { Editor } from './edit/editor/index.gts';
import Guest from './edit/guest.gts';
import Header from './edit/header';
import Help from './edit/help.gts';
import Layout from './edit/layout/index.gts';

import type RouterService from '@ember/routing/router-service';

class OpenOutput extends Component {
  @service declare router: RouterService;

  get href() {
    return this.router.currentURL?.replace('/edit?', '/output?');
  }

  <template>
    {{! template-lint-disable no-inline-styles }}
    <div style="position: absolute; top: 3rem; right: 1rem; color: rgb(80,80,80);">
      <Link
        href={{this.href}}
        target="_blank"
        title="Open output"
        style="padding: 0.5rem;"
        @iconOnly={{true}}
      />
    </div>
  </template>
}

<template>
  <Guest />

  <main class="grid h-screen max-h-screen grid-flow-col {{if (notInIframe) 'grid-rows-editor'}} ">
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
          <OpenOutput />
        </div>
      </:output>
    </Layout>

    <Help />
  </main>
</template>
