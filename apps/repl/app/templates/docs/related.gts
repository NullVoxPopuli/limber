import { ExternalLink } from '@nullvoxpopuli/limber-shared';

<template>
  <aside></aside>
  <div class="main-content">
    <h1>Related projects</h1>

    Do you know of or work on a REPL?<br />
    Feel free to PR it here ❤️
    <ExternalLink
      href="https://github.com/NullVoxPopuli/limber/edit/main/apps/repl/app/templates/docs/related.gts"
    >Edit this file on GitHub</ExternalLink>

    <h2>Other non-node, browser-focused REPLs</h2>
    These all do not use web-containers (node environment in the browser.
    <ul>
      <li>
        <ExternalLink href="https://github.com/zerdos/spike.land">spike.land</ExternalLink><br />
        React page-editor, built on Cloudflare workers
      </li>
      <li>
        <ExternalLink href="https://www.npmjs.com/package/devjar">devjar</ExternalLink><br />
        React-only REPL, uses CDNs such as esm.sh
      </li>
    </ul>

    <h2>Important Projects</h2>

    <ul>
      <li>
        <ExternalLink
          href="https://github.com/guybedford/es-module-lexer"
        >es-module-lexer</ExternalLink><br />
        Parses imports and exports without using a real parser (useful for quickly propagating the
        import graph)
      </li>
      <li>
        <ExternalLink
          href="https://github.com/guybedford/es-module-shims"
        >es-module-shims</ExternalLink><br />
        The core library that powers
        <a href="/docs/repl-sdk">repl-sdk</a>
        -- provides the in-browser way to intercept import behavior.
      </li>
    </ul>

    <hr />

    <h2>Tangentially Related Online Editors</h2>
    <ul>
      <li>
        <ExternalLink href="https://stackblitz.com">stackblitz</ExternalLink><br />
        Built on web-containers, running node in the browser.
      </li>

      <li>
        <ExternalLink href="https://codesandbox.io/">codesandbox</ExternalLink><br />
        "microVMs", AI, etc
      </li>
    </ul>

  </div>
</template>
