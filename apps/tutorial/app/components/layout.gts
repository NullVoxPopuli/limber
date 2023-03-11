import { ExternalLink, service }  from 'limber-ui';

import { Nav } from './nav';
import { Prose } from './prose';
import { Editor } from './editor';

const Footer = <template>
  <footer class="p-2 w-full grid">
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

      <main class="grid w-full grid-cols-tutorial">
        <section class="border-r border-r-[#ccc] drop-shadow flex flex-col justify-between bg-[#eee] text-black">
          <div class="grid grid-rows-[min-content_1fr]">
            <Nav />
            <Prose />
          </div>
          <Footer />
        </section>
        <Editor />
      </main>
    {{/if}}
  {{/let}}
</template>
