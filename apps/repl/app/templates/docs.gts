import './docs/styles.css';

import Package from '~icons/raphael/package?raw';

import type { TOC } from '@ember/component/template-only';

const NavLink: TOC<{
  Element: HTMLAnchorElement;
  Args: { icon?: string };
  Blocks: { default: [] };
}> = <template>
  {{! template-lint-disable link-href-attributes }}
  <a ...attributes>
    {{#if @icon}}
      <span>{{! template-lint-disable no-triple-curlies }}
        {{{@icon}}}</span>
    {{/if}}
    <span>{{yield}}</span>
  </a>
</template>;

<template>
  <nav class="docs-nav">
    <NavLink href="/docs/repl-sdk" @icon={{Package}}>repl-sdk</NavLink>
    <NavLink href="/docs/ember-repl" @icon={{Package}}>ember-repl</NavLink>
    <NavLink href="/docs/embedding">embedding</NavLink>
    <NavLink href="/docs/editor">editor</NavLink>
  </nav>

  <hr />

  <div class="centered-content">
    <main class="prose">
      {{outlet}}
    </main>
  </div>
</template>
