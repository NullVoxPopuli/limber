import Component from '@glimmer/component';
import { service } from '@ember/service';

import Output from '#components/output.gts';

import { ExternalLink as Link } from 'limber-ui';

import type RouterService from '@ember/routing/router-service';

class EditThis extends Component {
  @service declare router: RouterService;

  get href() {
    return this.router.currentURL?.replace('/output?', '/edit?');
  }

  <template>
    {{! template-lint-disable no-inline-styles }}
    <div style="position: fixed; bottom: 1rem; right: 1rem;">
      <Link href={{this.href}} target="_blank">Edit</Link>
    </div>
  </template>
}

<template>
  <Output @shadow={{false}} />
  <EditThis />
</template>
