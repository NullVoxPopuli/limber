import { ExternalLink } from 'limber-ui';

import { CodeBlock, example, H2, H3, issueURL, sample, Tutorial } from './support/code.gts';

const IssueLink = <template>
  <ExternalLink href={{issueURL}}>
    issue here
  </ExternalLink>
</template>;

const MetadataTags = <template>
  <ul>
    <li>
      <code>live</code>
      -
      <em>renders in place</em>
    </li>
    <li>
      <code>live preview</code>
      -
      <em>renders in place, placing the source after the live render</em>
    </li>
    <li>
      <code>live preview below</code>
      -
      <em>renders in place, placing the live render below the source</em>
    </li>
  </ul>
</template>;

const SupportedLanguages = <template>
  <ul>
    <li>
      gjs /
      <code>&lt;template&gt;</code>
      - to learn more about this format, see
      <Tutorial />
    </li>
    <li>
      glimdown - this is the default and is great for writing documentation / demos / etc.
    </li>
    <li>
      hbs - just a template
    </li>
  </ul>
</template>;

const Overview = <template>
  Overview:
  <nav>
    <ul>
      <li>
        <a href="#general-editing">General Editing</a>
        <ul>
          <li>
            <a href="#keyboard-navigation">Keyboard Navigation</a>
          </li>
          <li>
            <a href="#imports">Imports</a>
          </li>
        </ul>
      </li>
      <li>
        <a href="#supported-languages-and-formats">Supported Languages and Formats</a>
        <ul>
          <li><a href="#supported-markdown">Markdown</a></li>
          <li><a href="#supported-ember-gjs">Ember GJS</a></li>
          <li><a href="#supported-mermaid">Mermaid</a></li>
          <li><a href="#supported-svelte">Svelte</a></li>
          <li><a href="#supported-vanilla-js">Vanilla JS</a></li>
          <li><a href="#supported-vue">Vue</a></li>
          <li><a href="#supported-react-jsx">React JSX</a></li>
          <li><a href="#supported-ember-hbs">Ember HBS</a></li>
          <li><a href="#supported-glimdown">glimdown</a></li>
        </ul>
      </li>
    </ul>
  </nav>
</template>;

<template>
  <h1>Editing</h1>

  This REPL uses
  <ExternalLink href="https://codemirror.net/">codemirror</ExternalLink>
  which supports editing on both mobile and desktop devices, as well as proper keyboard
  accessibility.

  <br /><br />

  For any issues / questions, please file an
  <IssueLink />.

  <br /><br />
  <Overview />

  <H2 @id="general-editing" @text="General Editing" />

  Most of the supported languages and formats that build on top of javascript will require a default
  export so that the renderer knows what to call. But for non-javascript formats where there are no
  exports, this detail doesn't matter (such as when authoring
  <ExternalLink href="https://mermaid.js.org/">mermaid</ExternalLink>
  documents).

  <br />
  <br />
  <H3 @id="keyboard-navigation" @text="Keyboard Navigation" />
  When using the keyboard, the
  <kbd>TAB</kbd>
  key will indent code, or dedent (via
  <kbd>SHIFT</kbd>+<kbd>TAB</kbd>), as you may be used to in normal out-of-browser editors. In order
  to tab-out of the editor, you'll need to press the
  <kbd>ESCAPE</kbd>
  key first. When tabbing out of the editor, focus will hit the resize handle to change the size of
  the editor and output pane.

  <H3 @id="imports" @text="Imports" />

  In javascript-like languages and formats (or that have a javascript like section of their format),
  may import from anywhere. This includes NPM, CDNs, etc. Bare specifiers, such as in
  <code>import { ... } from 'package-name';</code>
  will reach out to NPM to download the tarball at the
  <code>latest</code>
  and extract its contents. This behavior can be changed by adding more to the import path.

  <ul>
    <li>
      <code>import { ... } from 'package-name@beta'</code>
      to request the beta version
    </li>
    <li>
      <code>import { ... } from 'package-name@1.2.3'</code>
      to request a specific version
    </li>
    <li>
      <code>import { ... } from 'package-name/sub-path'</code>
      to request a particular sub-path of the package. This is resolved via first downloading the
      package, and then referencing the
      <ExternalLink href="https://nodejs.org/api/packages.html#subpath-exports">sub-path exports</ExternalLink>
    </li>
    <li>
      <code>import { ... } from 'package-name@1.2.3/sub-path'</code>
      to request a particular sub-path of the package at a specific version
    </li>
    <li>
      <code>import { ... } from 'https://domain.com/any-path'</code>
      to request a module from another server. Any URL is supported. If you find something that
      doesn't work, please
      <ExternalLink href={{issueURL}}>open an issue</ExternalLink>
    </li>
    <li>
      <code>import { ... } from 'https://esm.sh/react-dom@19.1.0/client'</code>
      to request a module from
      <ExternalLink href="https://esm.sh/">esm.sh</ExternalLink>. Any of esm.sh's URLs and query
      parameters are supported. If you find something that doesn't work, please
      <ExternalLink href={{issueURL}}>open an issue</ExternalLink>
    </li>
    <li>
      <code>import { ... } from 'https://unpkg.com/three@0.174.0/build/three.module.min.js'</code>
      to request a module from
      <ExternalLink href="https://unpkg.com/">unpkg</ExternalLink>. Any of unpkg's URLs and query
      parameters are supported. If you find something that doesn't work, please
      <ExternalLink href={{issueURL}}>open an issue</ExternalLink>
    </li>

  </ul>

  <H2 @id="supported-languages-and-formats" @text="Supported Languages and Formats" />

  <H3 @id="supported-markdown" @text="Markdown" />
  <H3 @id="supported-ember-gjs" @text="Ember GJS" />
  <H3 @id="supported-mermaid" @text="Mermaid" />
  <H3 @id="supported-svelte" @text="Svelte" />
  <H3 @id="supported-vanilla-js" @text="Vanilla JS" />
  <H3 @id="supported-vue" @text="Vue" />
  <H3 @id="supported-react-jsx" @text="React JSX" />
  <H3 @id="supported-ember-hbs" @text="Ember HBS" />
  <H3 @id="supported-glimdown" @text="glimdown" />

  glimdown or
  <code>gmd</code>
  is the glimmer-flavored-markdown language format for aiding in creating documentation with
  highlighted and interactive code blocks. The editor has 3 modes
  <SupportedLanguages />

  When in markdown / glimdown mode, code fences can be used to live-render components via metadata
  tags as well as render the code snippet the live code comes from.

  <CodeBlock @code={{sample}} />

  <MetadataTags />

  The only language tags that are supported in markdown / glimdown are
  <code>hbs</code>
  and
  <code>gjs</code>
  with
  <code>gjs</code>
  being the most useful.

  <CodeBlock @code={{example}} />

  For any issues / questions, please file an
  <IssueLink />.
</template>
