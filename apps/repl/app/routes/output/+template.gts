import Component from '@glimmer/component';
import { service } from '@ember/service';

import Output from '#components/output.gts';
import { VerifyDanger } from '#components/verify-danger.gts';
import Guest from '#edit/guest.gts';
import { Status } from '#edit/layout/status.gts';

import { ExternalLink as Link } from '@nullvoxpopuli/limber-shared';

import type RouterService from '@ember/routing/router-service';

class EditThis extends Component {
  @service declare router: RouterService;

  get href() {
    return this.router.currentURL?.replace('/output?', '/edit?');
  }

  <template>
    <div style="position: fixed; bottom: 1rem; right: 1rem;">
      <Link href={{this.href}} target="_blank">Edit</Link>
    </div>
  </template>
}

<template>
  {{! The edit page frames this page when ember-source is pinned, and sends the text. }}
  <Guest />
  <VerifyDanger>
    <Output @shadow={{false}} />
  </VerifyDanger>
  <EditThis />
  <Status />
</template>
