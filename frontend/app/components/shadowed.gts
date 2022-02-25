import state from 'limber/helpers/state';

const attachShadow = (element, setShadow) => {
  setShadow(element.attachShadow({ mode: 'open' }));
};

// index.html has the production-fingerprinted references to these links
// Ideally, we'd have some pre-processor scan everything for references to
// assets in public, but idk how to set that up
const getStyles = () => {
  return [...document.head.querySelectorAll('link')].map(link => link.href);;
}

<template>
  {{#let (state) as |shadow|}}
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

