import "./docs/styles.css";

import Package from '~icons/raphael/package?raw';


<template>
  <nav class="docs-nav">
    <a href="/docs/repl-sdk">{{{Package}}} repl-sdk</a>
    <a href="/docs/ember-repl">{{{Package}}} ember-repl</a>
    <a href="/docs/embedding">embedding</a>
    <a href="/docs/editor">editor</a>
  </nav>

  <hr />

  <div class="centered-content">
    <main class="prose">
      {{outlet}}
    </main>
  </div>
</template>
