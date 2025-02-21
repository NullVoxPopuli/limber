import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCubes } from '@fortawesome/free-solid-svg-icons';

import { faEmber, faGithub } from '@fortawesome/free-brands-svg-icons';
import { notInIframe } from 'ember-primitives/iframe';

import { FormatButtons } from 'limber/components/limber/layout/controls/format-buttons';
import { ExternalLink } from 'limber-ui';

import DemoSelect from './demo-select';
import { Share } from './share';

<template>
  <header
    class="z-20 flex max-h-12 items-center justify-between bg-ember-black px-4 py-2 drop-shadow-lg"
  >
    <div class="flex items-center gap-2">
      <h1 class="flex items-center gap-2 text-ember-brand">
        <a
          class="focus:ring-4 focus:outline-none focus-visible:outline-none"
          href="https://emberjs.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          <FaIcon @icon={{faEmber}} @size="3x" class="-mt-2 -mb-3" />
          <span class="sr-only">Ember.JS homepage</span>
        </a>
      </h1>

      {{#if (notInIframe)}}
        <FormatButtons />
      {{/if}}
      <Share />
    </div>

    <nav class="flex items-baseline gap-2 text-white">
      <DemoSelect />

      <ExternalLink href="/bundle.html">
        <:custom as |DefaultContent|>
          <span class="hidden sm:block">
            <DefaultContent>
              Bundle
            </DefaultContent>
          </span>
          <span class="block px-2 sm:hidden">
            <FaIcon @icon={{faCubes}} />
          </span>
        </:custom>
      </ExternalLink>
      <ExternalLink href="https://github.com/nullvoxpopuli/limber">
        <:custom as |DefaultContent|>
          <span class="hidden sm:block">
            <DefaultContent>
              GitHub
            </DefaultContent>
          </span>
          <span class="block px-2 sm:hidden">
            <FaIcon @icon={{faGithub}} />
          </span>
        </:custom>
      </ExternalLink>

    </nav>
  </header>
</template>
