import './docs/styles.css';
// This side-effect import is needed because I forgot
// to include some variables imports in the sub-components.
import 'nvp.ui';

import { NavLink, Topics } from './docs/topics.gts';

<template>
  <nav class="docs-nav">
    <div class="left-nav">
      <Topics />
    </div>

    <div class="right-nav">
      <NavLink href="/edit">Back to REPL</NavLink>
    </div>
  </nav>

  <div class="centered-content">
    <main class="prose">
      {{outlet}}
    </main>
  </div>
</template>
