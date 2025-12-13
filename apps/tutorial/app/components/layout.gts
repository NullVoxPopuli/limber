import { service } from 'ember-primitives/helpers/service';

import { Editor } from './editor';
import { Footer } from './footer';
import { Nav } from './nav';
import { Prose } from './prose/index';
import { SmallScreenToggle } from './small-toggle';

function removeAppShell() {
  document.querySelector('#initial-loader')?.remove();
}

<template>
  {{#let (service "selected") as |tutorial|}}
    {{#if tutorial.isReady}}

      {{(removeAppShell)}}

      <main
        class="md:grid-cols-[minmax(min-content,_50%)_1fr] lg:grid-cols-[640px_1fr] grid h-[100dvh] max-h-[100dvh] w-full"
        data-container
      >
        <section
          class="text-black drop-shadow md:translate-x-0 z-10 flex max-h-[100dvh] max-w-[100dvw] flex-col justify-between border-r border-r-[#ccc] bg-[#eee] transition-transform"
          data-words
        >
          <div class="grid grid-rows-[min-content_1fr]">
            <Nav />
            <Prose />
          </div>
          <Footer />
        </section>
        <Editor class="inset-0 md:static fixed z-0" />
        <SmallScreenToggle class="bottom-4 right-4 md:hidden fixed z-20" />
      </main>
    {{/if}}
  {{/let}}
</template>
