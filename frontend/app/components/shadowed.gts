import { modifier } from 'ember-modifier';
import State from 'limber/helpers/state';

import type { TemplateOnlyComponent as TOC } from '@ember/component/template-only';


const attachShadow = modifier((element: Element, [setShadow]: [State['update']]) => {
  setShadow(element.attachShadow({ mode: 'open' }));
}, { eager: false });

// index.html has the production-fingerprinted references to these links
// Ideally, we'd have some pre-processor scan everything for references to
// assets in public, but idk how to set that up
const getStyles = () => [...document.head.querySelectorAll('link')].map(link => link.href);

const Shadowed: TOC<{
  Blocks: { default: [] }
}> =
<template>

  {{#let (State) as |shadow|}}
    <div data-shadow {{attachShadow shadow.update}}></div>

    {{#if shadow.value}}
      {{#in-element shadow.value}}
        {{#let (getStyles) as |styles|}}
          {{#each styles as |styleHref|}}
            <link rel="stylesheet" href={{styleHref}}>
          {{/each}}
        {{/let}}

        {{yield}}
      {{/in-element}}
    {{/if}}
  {{/let}}
</template>

export default Shadowed;
