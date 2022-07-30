// @ts-ignore
import { hash } from '@ember/helper';

import ContainerQuery from 'ember-container-query/components/container-query';
import aspectRatio from 'ember-container-query/helpers/cq-aspect-ratio';

import constrainVertically from 'limber/modifiers/constrain-vertically';

import type { TOC } from '@ember/component/template-only';

interface Signature {
  Blocks: {
    default: [boolean];
  }
}

export const Orientation: TOC<Signature> =
<template>
  <ContainerQuery
    @features={{hash isVertical=(aspectRatio max=1.2)}}
    {{! grid forces all the contents to take up all available vertical space }}
    class="grid"
    {{!-- @glint-ignore --}}
    {{constrainVertically}}
    as |query|
  >

    {{#let query.features.isVertical as |isVertical|}}

      {{yield isVertical}}

    {{/let}}

  </ContainerQuery>
</template>;

