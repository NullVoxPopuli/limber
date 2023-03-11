import { modifier } from 'ember-modifier';
import State from 'limber/helpers/state';

import type { TOC } from '@ember/component/template-only';

const attachShadow = modifier((element: Element, [setShadow]: [State['update']]) => {
  setShadow(element.attachShadow({ mode: 'open' }));
});

// index.html has the production-fingerprinted references to these links
// Ideally, we'd have some pre-processor scan everything for references to
// assets in public, but idk how to set that up
const getStyles = () => [...document.head.querySelectorAll('link')].map(link => link.href);

export const Shadowed: TOC<{
  Element: HTMLDivElement;
  Args: {
    omitStyles?: boolean;
  }
  Blocks: { default: [] }
}> =
<template>{{#let (State) as |shadow|}}
  {{! @glint-ignore }}
  <div data-shadow {{attachShadow shadow.update}} ...attributes></div>

  {{#if shadow.value}}
    {{#in-element shadow.value}}
      {{#unless @omitStyles}}
        {{#let (getStyles) as |styles|}}
          {{#each styles as |styleHref|}}
            <link rel='stylesheet' href={{styleHref}} />
          {{/each}}
        {{/let}}
      {{/unless}}

      {{yield}}
    {{/in-element}}
  {{/if}}
{{/let}}</template>

export default Shadowed;
