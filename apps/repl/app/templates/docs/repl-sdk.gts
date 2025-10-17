import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import highlighted from '../../modifiers/highlighted';
import { formats } from './repl-sdk/formats.ts';
import { H2, H3, H4 } from './support/code.gts';

const samples = {
  compile: {
    basic: `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();

const { element, destroy }
  = await compiler.compile('vue', '...', { /* options */ });

document.body.appendChild(element);

// sometime later, cleanup
destroy();`,
  },
  createEditor: {
    basic: `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();


await compiler.createEditor(
  // where to mount the editor
  element,
  {
    // initial text
    text,
    // initial file format (selects which plugins / syntax extensions to activate)
    format,
    // function to handle when the editor wants to submit updated text
    handleUpdate,
    // additional configuration of CodeMirror
    extensions: [ /* ... */ ],
  }
);
`,
  },
  Compiler: {
    basic: `import { Compiler } from 'repl-sdk';

const compiler = new Compiler();`,
    debug: `import { Compiler } from 'repl-sdk';

const compiler = new Compiler({
  logging: location.search.includes('debug'),
});
`,
    onlog: `import { Compiler } from 'repl-sdk';

const compiler = new Compiler({
  on: {
    log: (type, message) => {
      // put log messages somewhere
    }
  }
});
`,
    options: `import { Compiler } from 'repl-sdk';

const compiler = new Compiler({
  options: {
    md: {
      remarkPlugins: [ /* ... */ ]
    },
    gjs: {
      owner: {
        lookup: () => {}
        resolveRegistration: () => {}
      }
    },
    jsx: {
      react: {
        /* ... */
      }
    }
  }
});
`,
  },
  defaults: {
    basic: `import { Compiler, defaults } from 'repl-sdk';

const { formats } = defaults;

const compiler = new Compiler({
  formats: {
    // Only configure the compiler for Svelte and Vue
    svelte: formats.svelte,
    vue: formats.vue,
  }
})
`,
  },
};

<template>
  <aside>
    <nav>
      <ul>
        <li><a href="#install">Install</a></li>
        <li><a href="#bundled-compilers">Bundled Compilers</a>
          <ul class="toc-formats">
            <li><a href="#format-gjs">gjs</a></li>
            <li><a href="#format-gmd">gmd</a></li>
            <li><a href="#format-hbs">hbs</a>
              (
              <a href="#format-hbs-ember">ember</a>
              )
            </li>
            <li><a href="#format-js">js</a></li>
            <li><a href="#format-jsx">jsx</a>
              (
              <a href="#format-jsx-react">react</a>
              )
            </li>
            <li><a href="#format-md">md</a></li>
            <li><a href="#format-mermaid">mermaid</a></li>
            <li><a href="#format-svelte">svelte</a></li>
            <li><a href="#format-vue">vue</a></li>
          </ul>
        </li>
        <li><a href="#api-overview">API Overview</a>
          <ul>

            <li><a href="#index-Compiler">Compiler</a>
              <ul>
                <li><a href="#index-Compiler-compile">Compiler#compile</a></li>
                <li><a href="#index-Compiler-createEditor">Compiler#createEditor</a></li>
              </ul>
            </li>
            <li><a href="#index-defaults">defaults</a></li>

          </ul>

        </li>
      </ul>
    </nav>
  </aside>

  <section>
    <h1>repl-sdk</h1>

    <p>
      The repl-sdk is a singleton
      <em>per</em>
      window. There is a
      <code>Compiler</code>
      class that has two responsibilities, once configured. Those two responsibilities:
      <ul>
        <li>render
          <em>something</em>
          based on the input (text + format)<br />
          This includes:
          <ul>
            <li>downloading imported dependencies from npm</li>
            <li>dynamically loading support for implemented compilers</li>
            <li>handle custom compilers provided by a consumer</li>
            <li>out of the box compilers are configurable</li>
          </ul>
        </li>
        <li>(optionally) create an editor with syntax highlighting, folding, etc</li>
      </ul>
    </p>

    <H2 @id="install">Install</H2>

    With your favorite package manager

    <div data-format="bash" {{highlighted "npm add repl-sdk"}}></div>
    <div data-format="bash" {{highlighted "pnpm add repl-sdk"}}></div>
    (etc)

    <H2 @id="bundled-compilers">Bundled Compilers</H2>

    repl-sdk will not load any compiler out of the box on its, unless a
    <code>compile</code>
    request is made for that compiler's registered
    <code>format</code>
    (sometimes narrowed by a "<code>flavor</code>").

    <br /><br />
    Each
    <code>format</code>
    represents a
    <i>file extension</i>. For some
    <code>format</code>s, there are multiple
    <code>flavor</code>s, like for
    <code>jsx</code>.

    {{#each formats as |format|}}
      <format />
    {{/each}}

    <H2 @id="api-overview">API Overview</H2>

    There is only available module, and two exports from that module

    <div data-format="js" {{highlighted "import {
  Compiler,
  defaults
} from 'repl-sdk';"}}></div>

    <H3 class="code-link" @id="index-Compiler"><code>Compiler</code>
      from repl-sdk</H3>

    By default, no configuration is needed.

    <div data-format="js" {{highlighted samples.Compiler.basic}}></div>

    Debug logging can be configured on or conditionally on via any means you choose. Here we can
    configure logging when
    <code>debug</code>
    is present in the query params. This is
    <em>very</em>
    noisy for some module graphs, but is helpful in debugging the internal of
    <code>repl-sdk</code>.

    <div data-format="js" {{highlighted samples.Compiler.debug}}></div>

    If you want to wire up the higher-level messaging from each compiler to your UI, there is this
    <code>on.log</code>
    function that can be configured to push log messages outside of the
    <code>Compiler</code>

    <div data-format="js" {{highlighted samples.Compiler.onlog}}></div>

    The
    <code>Compiler</code>
    can take an options object for configuring each of the compilers. They each may take a different
    configuration, and will ignore any options that are not expected.

    <div data-format="js" {{highlighted samples.Compiler.options}}></div>

    <H4 class="code-link" @id="index-Compiler-compile"><code>&lt;Compiler#compile&gt;</code></H4>

    Calling compile takes 2 to 3 arguments, the file format, the file to compile, and then an
    optional set of options. The options are optional for all file formats except when there is some
    ambiguity -- such as for the
    <code>jsx</code>
    and
    <code>hbs</code>
    file formats.

    <br /><br />
    The element doesn't need to be immediately attached anywhere, but in order for the user to view
    what was compiled, it will need to be placed somewhere.

    <div data-format="js" {{highlighted samples.compile.basic}}></div>

    <H4 class="code-link" @id="index-Compiler-createEditor"><code
      >&lt;Compiler#createEditor&gt;</code></H4>

    This editor uses
    <ExternalLink href="https://codemirror.net/">codemirror</ExternalLink>
    which supports editing on both mobile and desktop devices, as well as proper keyboard
    accessibility.
    <br /><br />
    It has all extensions and syntax configured for each of the supported language formats.

    <br /><br />
    This is
    <code>await import</code>'d, so if you don't want to use codemirror, you will not pay for the
    bytes of codemirror in your bundled project.

    <div data-format="js" {{highlighted samples.createEditor.basic}}></div>

    <H3 class="code-link" @id="index-defaults"><code>defaults</code>
      from repl-sdk</H3>

    This is the default configuration for the
    <code>Compiler</code>. It provides only the
    <code>formats</code>
    configuration with all the default compilers.

    <br /><br />This can be used to add custom compilers, remove existing compilers, or replace them
    entirely.

    <div data-format="js" {{highlighted samples.defaults.basic}}></div>

    Each compiler is
    <code>await import</code>'d so omitting compilers from this options object will omit their code
    from your final bundles.
  </section>
</template>
