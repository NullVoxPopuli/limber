import { ExternalLink, service, Button }  from 'limber-ui';

import { Nav } from './nav';
import { Prose } from './prose';
import { Editor } from './editor';
import { SmallScreenToggle } from './small-toggle';

const Footer = <template>
  <footer class="p-2 w-full grid shadow border-t">
    <nav class="mx-auto flex gap-4">
      <ExternalLink href="https://guides.emberjs.com/">
        Guides
      </ExternalLink>
      <ExternalLink href="https://api.emberjs.com">
        API Reference
      </ExternalLink>
      <ExternalLink href="http://new.emberjs.com">
        Blitz
      </ExternalLink>
    </nav>
  </footer>
</template>;


function removeAppShell() {
  document.querySelector('#initial-loader')?.remove();
}

<template>
  {{#let (service 'selected') as |tutorial|}}
    {{#if tutorial.isReady}}

      {{ (removeAppShell) }}

      <main class="grid w-full md:grid-cols-tutorial h-[100dvh] max-h-[100dvh]" data-container>
        <section class="
          transition-all md:translate-x-0 z-10
          border-r border-r-[#ccc] drop-shadow flex flex-col justify-between
          bg-[#eee] text-black
          max-h-[100dvh] max-w-[100dvw]
          "
          data-words
        >
          <div class="grid grid-rows-[min-content_1fr]">
            <Nav />
            <Prose class="max-h-[calc(100dvh-94px)]" />
          </div>
          <Footer />
        </section>
        <Editor class="fixed inset-0 md:static z-0" />
        <SmallScreenToggle class="md:hidden fixed bottom-4 right-4 z-20" />
      </main>
    {{/if}}
  {{/let}}
</template>
