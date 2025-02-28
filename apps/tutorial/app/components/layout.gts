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
        class="grid h-[100dvh] max-h-[100dvh] w-full md:grid-cols-[minmax(min-content,_50%)_1fr] lg:grid-cols-[640px_1fr]"
        data-container
      >
        <section
          class="z-10 flex max-h-[100dvh] max-w-[100dvw] flex-col justify-between border-r border-r-[#ccc] bg-[#eee] text-black drop-shadow transition-transform md:translate-x-0"
          data-words
        >
          <div class="grid grid-rows-[min-content_1fr]">
            <Nav />
            <Prose />
          </div>
          <Footer />
        </section>
        <Editor class="fixed inset-0 z-0 md:static" />
        <SmallScreenToggle class="fixed bottom-4 right-4 z-20 md:hidden" />
      </main>
    {{/if}}
  {{/let}}
</template>
