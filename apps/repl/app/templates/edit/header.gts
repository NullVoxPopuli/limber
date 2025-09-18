import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faEmber, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import { notInIframe } from 'ember-primitives/iframe';

import { default as Docs } from '~icons/pajamas/document?raw';

import { ExternalLink } from 'limber-ui';

import DemoSelect from './demo-select.gts';
import { FormatButtons } from './format-buttons.gts';
import { Share } from './share.gts';

<template>
  <header
    class="bg-ember-black z-20 flex max-h-12 items-center justify-between px-1 py-2 drop-shadow-lg md:px-4"
  >
    <div class="flex items-center gap-2">
      <h1 class="text-ember-brand flex items-center gap-2">
        <a
          class="hidden focus:outline-none focus:ring-4 focus-visible:outline-none md:inline-block"
          href="https://emberjs.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          <FaIcon @icon={{faEmber}} @size="3x" class="-mb-3 -mt-2" />
          <span class="sr-only">Ember.JS homepage</span>
        </a>
      </h1>

      {{#if (notInIframe)}}
        <FormatButtons />
      {{/if}}
      <DemoSelect />
      <Share />
    </div>

    <nav class="flex items-baseline gap-2 text-white">
      <ExternalLink href="/docs" class="hidden sm:block">
        <:custom as |DefaultContent|>
          <span class="hidden md:block">
            <DefaultContent>
              Documentation
            </DefaultContent>
          </span>
          <span class="md:hidden">
            {{! template-lint-disable no-triple-curlies }}
            {{{Docs}}}
          </span>
        </:custom>
      </ExternalLink>
      <ExternalLink href="/bundle.html" class="hidden sm:block">
        <:custom as |DefaultContent|>
          <span class="hidden md:block">
            <DefaultContent>
              Bundle
            </DefaultContent>
          </span>
          <span class="md:hidden">
            <FaIcon @icon={{faCubes}} />
          </span>
        </:custom>
      </ExternalLink>
      <ExternalLink href="https://github.com/nullvoxpopuli/limber" class="hidden px-2 sm:block">
        <:custom as |DefaultContent|>
          <span class="hidden md:block">
            <DefaultContent>
              GitHub
            </DefaultContent>
          </span>
          <span class="md:hidden">
            <FaIcon @icon={{faGithub}} />
          </span>
        </:custom>
      </ExternalLink>

    </nav>
  </header>
</template>
