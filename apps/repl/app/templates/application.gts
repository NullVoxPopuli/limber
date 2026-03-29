import { PortalTargets } from 'ember-primitives/components/portal-targets';
import { cleanupSSRContent } from 'vite-ember-ssr/client';

<template>
  {{cleanupSSRContent}}
  <PortalTargets />

  {{outlet}}
</template>
