import { Tabs } from 'nvp.ui/tabs';

import { ExternalLink } from '@nullvoxpopuli/limber-shared';

import highlighted from '../../modifiers/highlighted.ts';
import { H2, H3 } from './support/code.gts';
import { Type } from './support/type.gts';

const samples = {
  setup: {
    basic: `import { setupCompiler } from 'ember-repl';

export default class Application extends Route {
  async beforeModel() {
    await setupCompiler(this, {
      options: {
        md: {
          rehypePlugins: [ /* ... */ ],
          remarkPlugins: [ /* ... */ ],
        },
      },
      modules: {
        'some-path': () => import('some-path'),
        'stubbed-or-fake': () => ({ value: 'here' }),
      }
    });
  }
}`,
  },
  compile: {
    basic: `import { compile, getCompiler } from 'ember-repl';

export default class Demo extends Service {
  @tracked doc = '...';

  someMethod = () => {
    let compiler = getCompiler(this):

    return compile(compiler, this.doc, {
      format: 'gjs',
    });
  }
}
`,
  },
  Compiled: {
    svelte: `import { Compiled } from 'ember-repl';

const doc = '...';

<template>
    {{#let (Compiled doc 'svelte') as |state|}}
      {{#if state.component}}
        <state.component />
      {{/if}}

      {{#if state.error}}
        oof, {{state.reason}}
      {{/if}}
    {{/let}}
</template>`,
    inJS: `import { Compiled } from 'ember-repl';
import { use } from 'ember-resources';

class Demo extends Component {
  @use compileState = Compiled(doc, 'gjs');

  get component() {
    return this.compileState.component;
  }

  <template>
    {{#if this.component}}
      <this.component />
    {{/if}}

    {{#if this.compileState.error}}
      oh no, {{this.compileState.reason}}
    {{/if}}
  </template>
}
`,
    inJSReactive: `import { Compiled } from 'ember-repl';
import { use } from 'ember-resources';

class Demo extends Component {
  @tracked doc = '...';
  @tracked format = '...';

  @use compileState = Compiled(() => this.doc, () => this.format);

  get component() {
    return this.compileState.component;
  }

  <template>
    {{#if this.component}}
      <this.component />
    {{/if}}

    {{#if this.compileState.error}}
      oh no, {{this.compileState.reason}}
    {{/if}}
  </template>
}
`,
  },
};

<template>
  <aside>
    <nav>
      <ul>
        <li><a href="#install">Install</a></li>
        <li><a href="#compatibility">Compatibility</a></li>
        <li><a href="#api-overview">API Overview</a>
          <ul>
            <li><a href="#index-setupCompiler">setupCompiler</a></li>
            <li><a href="#index-compile">compile</a></li>
            <li><a href="#index-Compiled">Compiled</a></li>
            <li><a href="#index-getCompiler">getCompiler</a></li>
            <li><a href="#index-Format">Format</a></li>
            <li><a href="#index-CompileState">CompileState</a></li>
            <li>test-support
              <ul>

                <li><a href="#test-support-setupCompiler">setupCompiler</a></li>
                <li><a href="#test-support-clearCache">clearCache</a></li>
                <li><a href="#test-support-clearCompileCache">clearCompileCache</a></li>
              </ul>
            </li>

          </ul>

        </li>

      </ul>
    </nav>

  </aside>
  <div class="main-content">
    <h1>ember-repl</h1>

    <code>ember-repl</code>
    is an ember-specific integration with
    <a href="/docs/repl-sdk"><code>repl-sdk</code></a>
    providing reactive APIs, test utilities, default module configurations -- making
    <code>repl-sdk</code>
    more ergonomic to use in ember projects.
    <br /><br />

    Just like with
    <code>repl-sdk</code>, all languages and formats can be used in the same project.

    <H2 @id="install">Install</H2>

    With your favorite package manager

    <Tabs as |Tab|>
      <Tab @label="npm">
        <div data-format="bash" {{highlighted "npm add ember-repl"}}></div>
      </Tab>
      <Tab @label="pnpm">
        <div data-format="bash" {{highlighted "pnpm add ember-repl"}}></div>
      </Tab>
    </Tabs>
    For the time being, until
    <ExternalLink href="https://github.com/babel/babel/pull/17653">babel#17635</ExternalLink>
    is merged and released, we need to use a different version of
    <code>@babel/standalone</code>
    that supports async plugins.

    <pre>"pnpm": {
  "overrides": {
    "@babel/standalone": "https://pkg.pr.new/babel/babel/@babel/standalone@0fe661460049cbc4f2b96fdeb0d6ce17b89b3bef"
  }
}</pre>

    <H2 @id="compatibility">Compatibility</H2>

    <ul>
      <li><code>vite</code> @ ^6+ | only vite-using ember projects are supported</li>
      <li><code>ember-source</code> @ ^6.8+</li>
    </ul>

    It's
    <em>possible</em>
    that other environments and ember-source versions could work, but I don't want to formally spend
    time figuring out how to support them.

    <H2 @id="api-overview">API Overview</H2>

    The following modules are available:
    <ul>
      <li><code>import { ... } from "ember-repl";</code></li>
      <li><code>import { ... } from "ember-repl/test-support";</code></li>
    </ul>

    For deeper understand of what is possible, you'll want to
    <ExternalLink
      href="https://github.com/NullVoxPopuli/limber/blob/main/packages/ember-repl/src/index.ts"
    >read the source</ExternalLink>
    for the real function's method signatures. The full signatures are abbreviated here in this
    document for brevity.

    <H3 class="code-link" @id="index-setupCompiler"><code>setupCompiler</code>
      from ember-repl</H3>

    This is the main setup method for the compiler -- it allows you to specify default options for
    the compilers, and define your import-map, allowing you to smoothly use
    <code>ember-repl</code>
    for any set of code (even private unpublished code), or entirely unpublished modules. For
    example, it may be set up in the application's beforeModel hook:

    <div data-format="js" {{highlighted samples.setup.basic}}></div>

    All key-value pairs passed to the second argument of
    <code>setupCompiler</code>
    are optional.
    <br /><br />
    In
    <code>ember-repl</code>
    some modules are configured for you. These may be reviewed
    <ExternalLink
      href="https://github.com/NullVoxPopuli/limber/blob/main/packages/ember-repl/src/services/known-modules.ts"
    >here, in known-modules.ts</ExternalLink>

    <H3 class="code-link" @id="index-compile"><code>compile</code>
      from ember-repl</H3>

    Returns a
    <a href="#index-CompileState">CompileState</a>.
    <br />
    This function takes the
    <code>CompilerService</code>
    a text document, and a bag of options, depending on what format is specified (which is
    required).

    <br /><br />Example:
    <div data-format="js" {{highlighted samples.compile.basic}}></div>

    <H3 class="code-link" @id="index-Compiled"><code>Compiled</code>
      from ember-repl</H3>

    Returns a
    <a href="#index-CompileState">CompileState</a>.
    <br />
    A reactive utility for building dynamic components / render-outputs of an input document. This
    wraps the above
    <a href="#index-compile">compile</a>
    function.

    <br /><br />Example:
    <div data-format="gjs" {{highlighted samples.Compiled.svelte}}></div>

    This can also be used in a class:
    <div data-format="gjs" {{highlighted samples.Compiled.inJS}}></div>

    And there are sufficient overloads to allow reactive class usage via lazy access via arrow
    functions:
    <div data-format="gjs" {{highlighted samples.Compiled.inJSReactive}}></div>

    <H3 class="code-link" @id="index-getCompiler"><code>getCompiler</code>
      from ember-repl</H3>

    This returns the
    <code>CompilerService</code>
    for the given
    <code>owner</code>
    -- and if an owner isn't provided, we'll try to call
    <code>getOwner</code>
    for you. You are only allowed one compiler for a whole browser document. Example:

    <div
      data-format="js"
      {{highlighted
        "import { getCompiler } from 'ember-repl';
// ...
export default class Application extends Route {
  beforeModel() {
    const compiler = getCompiler(this);
    // ...
  }
}"
      }}
    ></div>

    <H3 class="code-link" @id="index-Format">type
      <code>Format</code>
      from ember-repl</H3>

    This is the union of all allowed
    <code>filetype</code>
    formats. As in what the file extension would be if the provided REPL document were an actual
    file.

    <H3 class="code-link" @id="index-CompileState">type
      <code>CompileState</code>
      from ember-repl</H3>

    This type is the return value from
    <code>compile</code>
    and
    <code>Compiled</code>. It represents the state and progress of a compile attempt. The important
    properties on this type:
    <ul class="poor-mans-typedoc">
      <li>
        <Type @name="component" @type="ComponentLike | undefined">
          This is the returned component, if compilation was successful.
        </Type>
      </li>
      <li>
        <Type @name="error" @type="Error | undefined">
          If an error ocurred, this will be the thrown error.
        </Type>
      </li>
      <li>
        <Type @name="isReady" @type="boolean">
          indicates if rendering is in progress (false) or if we're ready to render the component
          (true)
        </Type>
      </li>
      <li>
        <Type @name="format" @type="string">
          The compiler format used for this compile
        </Type>
      </li>
      <li>
        <Type @name="reason" @type="string | undefined">
          If an error occurred, this property represents a (hopefully) human readable representation
          of what happened or what caused the error.
        </Type>
      </li>
      <li>
        <Type @name="isWaiting" @type="boolean">
          Are we waiting for the compilation attempt to finish? This is more precise than
          <code>isReady</code>
          for "completion", because an error also causes
          <code>isWaiting</code>
          to flip -- whereas if we have an error, we are
          <em>not</em>
          ready (<code>isReady</code>
          === false) to render.
        </Type>
      </li>
      <li>
        <Type @name="promise" @type="Promise">
          For imperative usage, you may await the compilation.
        </Type>
      </li>
    </ul>

    <H3 class="code-link" @id="test-support-setupCompiler"><code>setupCompiler</code>
      from ember-repl/test-support</H3>

    This test utility should be the main one used for your tests, as it configures each test to
    start with a clean environment, clear of the main caches. It does not clear the compile cache by
    default because the same input should always create the same output -- which helps speed up test
    execution for repeat code samples.

    <br />
    NOTE that this is not needed if your test ultimately runs code that runs the app
    <code>setupCompiler</code>
    (descscribed above from the
    <code>ember-repl</code>
    import).

    <br /><br />Usage:

    <div
      data-format="js"
      {{highlighted
        "import { module, test } from 'qunit';
import { setupCompiler } from 'ember-repl/test-support';

module('a scenario', function (hooks) {
  setupCompiler(hooks);

  test('your test here', async function (assert) {
    // ...
  });
});"
      }}
    ></div>

    By default this only provides the basics. For improving test speed, and avoiding hitting the
    internet during testing, you may want to specify an import map (which allows you to also stub
    modules):

    <div
      data-format="js"
      {{highlighted
        "import { module, test } from 'qunit';
import { setupCompiler } from 'ember-repl/test-support';

module('a scenario', function (hooks) {
  setupCompiler(hooks, {
    modules: {
      'import-path': () => import('import-path'),
      'fake-package': () => ({ fake: 'module' })
    }
  });
  // ...
});"
      }}
    ></div>

    If you desire to clear the
    <code>ember-repl</code>
    compile cache, that can be configured as well:
    <div
      data-format="js"
      {{highlighted
        "import { module, test } from 'qunit';
import { setupCompiler } from 'ember-repl/test-support';

module('a scenario', function (hooks) {
  setupCompiler(hooks, {
    clearCache: true
  });
  // ...
});"
      }}
    ></div>

    Lastly,
    <code>setupCompiler</code>
    supports configuring the compilers provided by
    <code>repl-sdk</code>, similarly to how you'd configure the compiler in your actual app code:

    <div
      data-format="js"
      {{highlighted
        "import { module, test } from 'qunit';
import { setupCompiler } from 'ember-repl/test-support';

module('a scenario', function (hooks) {
  setupCompiler(hooks, {
    options: {
      md: {
        rehypePlugins: [ /* ... */ ],
        remarkPlugins: [ /* ... */ ],
      },
    }
  });
  // ...
});"
      }}
    ></div>

    If you have a heavy amount of configuration of the compiler in your actual app code, it may be
    beneficial to extract that configuration to a variable for sharing with this test-support
    version of
    <code>setupCompiler</code>

    <H3 class="code-link" @id="test-support-clearCache"><code>clearCache</code>
      from ember-repl/test-support</H3>

    This test utility will clear all the Compliler caches in
    <code>repl-sdk</code>, but not the caches with
    <code>ember-repl</code>. These caches include:
    <ul>
      <li>promise cache</li>
      <li>request cache</li>
      <li>tarball cache</li>
    </ul>

    Usage:

    <div
      data-format="js"
      {{highlighted
        "import { module, test } from 'qunit';
import { clearCache } from 'ember-repl/test-support';

module('a scenario', function (hooks) {
  clearCache(hooks);

  test('your test here', async function (assert) {
    // ...
  });
});"
      }}
    ></div>

    However, this is not needed if you are using
    <code>setupComplier</code>.

    <H3 class="code-link" @id="test-support-clearCompileCache"><code>clearCompileCache</code>
      from ember-repl/test-support</H3>

    This test utility will clear the overall compile cache managed by
    <code>ember-repl</code>

    It is invoked manually, either in a test, or test lifecycle hook.
    <br /><br />Usage:
    <div
      data-format="js"
      {{highlighted
        "import { module, test } from 'qunit';
import { clearCompileCache } from 'ember-repl/test-support';

module('a scenario', function (hooks) {
  // ...

  test('your test here', async function (assert) {
    clearCompileCache();
    // ...
  });
});"
      }}
    ></div>

  </div>
</template>
