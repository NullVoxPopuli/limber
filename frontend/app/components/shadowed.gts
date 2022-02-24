import state from 'limber/helpers/state';

export interface Args {
  omitStyles: boolean;
}

const t = '{{rootURL}}/assets/tailwind.css';

console.log({ t, a: '/assets/tailwind.css', b: 'assets/tailwind.css' });

const attachShadow = (element: HTMLElement, setShadow) => {
  setShadow(element.attachShadow({ mode: 'open' }));
};

<template>
  {{#let (state) as |shadow|}}
    <div data-shadow {{attachShadow shadow.update}}></div>

    {{#if shadow.value}}
      {{#in-element shadow.value}}
        {{#unless @omitStyles}}
          <link rel="stylesheet" href="/assets/tailwind.css">
          <link rel="stylesheet" href="/assets/vendor.css">
          <link rel="stylesheet" href="/assets/app.css">
        {{/unless}}

        {{yield}}
      {{/in-element}}
    {{/if}}
  {{/let}}

</template>

