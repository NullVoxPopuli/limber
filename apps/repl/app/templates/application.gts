import { PortalTargets } from 'ember-primitives/components/portal-targets';

<template>
  <PortalTargets />

  {{outlet}}

  <div id="limber-portal-target-global-hint"></div>

  <style scoped>
    #limber-portal-target-global-hint {
      position: fixed;
      bottom: -10rem;
      padding: 1rem;
      z-index: 1;
      transition: all 0.1s;
      width: 100%;
      text-align: center;
      font-weight: bold;
      text-shadow: 0px 0px 6px white;
      /* https://cssgradient.io/ */
      height: 26rem;
      display: flex;
      justify-content: center;
      align-items: end;
      text-transform: lowercase;

       > div, > footer, > button {
border: 1px solid;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  background: white;
filter: drop-shadow(0px 10px 10px rgba(0,0,0,0.4));
        }
    }
    #limber-portal-target-global-hint:has(>div,>footer,>button) {
      bottom: 0;
    }

  </style>
</template>
