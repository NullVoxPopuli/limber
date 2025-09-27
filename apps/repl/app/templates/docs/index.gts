import { ExternalLink } from 'limber-ui';

import { issueURL } from './support/code.gts';
import { Topics } from './topics.gts';

<template>
  <br /><br />
  <div class="centered-content">
    <main class="prose">
      <h1>welcome to the docs ❤️</h1>

      <p>
        <br /><br />
        if anything looks out of place, please let me know by
        <ExternalLink href={{issueURL}}>creating an issue</ExternalLink>
      </p>

      <p>
        Topics:

        <nav class="vertical-nav">
          <Topics />
        </nav>
      </p>
    </main>
  </div>
</template>
