import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

import ExternalLink from '../external-link';
import DemoSelect from './demo-select';

<template>
  <header class="bg-ember-black flex justify-between items-center shadow-lg py-2 px-4 max-h-12">
    <h1 class='text-ember-brand flex gap-2 items-center'>
      <a
        class="focus:ring-4 focus:outline-none focus-visible:outline-none"
        href="https://emberjs.com"
        target="_blank"
        rel="noreferrer noopener"
      >
        <FaIcon @icon="ember" @prefix="fab" @size="3x" class="-mb-3 -mt-2" />
        <span class="sr-only">Ember.JS homepage</span>
      </a>
      <FaIcon @icon="markdown" @prefix="fab" @size="2x" class="-mb-2 -mt-2" />
    </h1>

    <nav class='text-white mt-1 flex gap-2 items-baseline'>
      <DemoSelect class="hidden sm:block" />
      <ExternalLink href="/assets/bundle.html">Bundle</ExternalLink>
      <ExternalLink href="https://github.com/nullvoxpopuli/limber">GitHub</ExternalLink>
    </nav>
  </header>
</template>
