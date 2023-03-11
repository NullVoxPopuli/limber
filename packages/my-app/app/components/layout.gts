import { Selection } from './selection';
import { Prose } from './prose';
import { Editor } from './editor';

// TODO: use ExternalLink from addon
// TODO: use gts in v2 addon
const Footer = <template>
  <footer>
    <a href="https://guides.emberjs.com/">
      Guides
    </a>
    <a href="https://api.emberjs.com">
      API Reference
    </a>
    <a href="http://new.emberjs.com">
      Blitz
    </a>
  </footer>
</template>;

<template>
  <div class="container">
    <main>
      <section>
        <Selection />
        <Prose />
      </section>
      <Editor />
    </main>
    <Footer />
  </div>
</template>
