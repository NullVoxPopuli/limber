import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faEmber, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import { notInIframe } from 'ember-primitives/iframe';

import { default as Docs } from '~icons/pajamas/document?raw';

import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import DemoSelect from './demo-select.gts';
import { FormatButtons } from './format-buttons.gts';
import { Share } from './share.gts';

<template>
  <header
    class="bg-ember-black max-h-12 px-1 py-2 drop-shadow-lg md:px-4 z-20 flex items-center justify-between"
  >
    <div class="gap-2 flex items-center">
      <h1 class="text-ember-brand gap-2 flex items-center">
        <a
          class="md:inline-block hidden focus:ring-4 focus:outline-none focus-visible:outline-none"
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

    <nav class="gap-2 text-white flex items-baseline">
      <ExternalLink href="/docs" class="sm:block hidden">
        <:custom as |DefaultContent|>
          <span class="md:block hidden">
            <DefaultContent>
              Docs
            </DefaultContent>
          </span>
          <span class="md:hidden">
            {{! template-lint-disable no-triple-curlies }}
            {{{Docs}}}
          </span>
        </:custom>
      </ExternalLink>
      <ExternalLink href="/bundle.html" class="sm:block hidden">
        <:custom as |DefaultContent|>
          <span class="md:block hidden">
            <DefaultContent>
              Bundle
            </DefaultContent>
          </span>
          <span class="md:hidden">
            <FaIcon @icon={{faCubes}} />
          </span>
        </:custom>
      </ExternalLink>
      <ExternalLink
        href="https://github.com/nullvoxpopuli/limber"
        class="px-2 sm:block hidden"
      >
        <:custom as |DefaultContent|>
          <span class="md:block hidden">
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
