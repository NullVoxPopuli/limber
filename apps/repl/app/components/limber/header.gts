import { faEmber,faGithub} from '@fortawesome/free-brands-svg-icons';
import {faCubes} from '@fortawesome/free-solid-svg-icons';
import { notInIframe } from 'ember-primitives/iframe';

import { FormatButtons } from 'limber/components/limber/layout/controls/format-buttons';
import { ExternalLink } from 'limber-ui';

import DemoSelect from './demo-select';

<template>
  <header
    class="bg-ember-black flex justify-between items-center drop-shadow-lg z-20 py-2 px-4 max-h-12"
  >
    <div class="flex gap-2 items-center">
      <h1 class="text-ember-brand flex gap-2 items-center">
        <a
          class="focus:ring-4 focus:outline-none focus-visible:outline-none"
          href="https://emberjs.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          {{{faEmber}}}
          <!-- <FaIcon @icon="ember" @prefix="fab" @size="3x" class="-mb-3 -mt-2" /> -->
          <span class="sr-only">Ember.JS homepage</span>
        </a>
        {{!<FaIcon @icon="markdown" @prefix="fab" @size="2x" class="-mb-2 -mt-2" />}}
      </h1>

      {{#if (notInIframe)}}
        <FormatButtons />
      {{/if}}
    </div>

    <nav class="text-white flex gap-2 items-baseline">
      <DemoSelect />

      <ExternalLink href="/bundle.html">
        <:custom as |DefaultContent|>
          <span class="hidden sm:block">
            <DefaultContent>
              Bundle
            </DefaultContent>
          </span>
          <span class="block sm:hidden px-2">
            {{{faCubes}}}
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
          <span class="block sm:hidden px-2">
            {{{faGithub}}}
          </span>
        </:custom>
      </ExternalLink>

    </nav>
  </header>
</template>
