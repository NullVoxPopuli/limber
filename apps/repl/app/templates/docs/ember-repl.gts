import highlighted from '../../modifiers/highlighted.ts';
import { H2, H3 } from './support/code.gts';

<template>
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

  <div data-format="bash" {{highlighted "npm add ember-repl"}}></div>
  <div data-format="bash" {{highlighted "pnpm add ember-repl"}}></div>
  (etc)

  <H2 @id="compatibility">Compatibility</H2>

  <ul>
    <li><code>vite</code> @ ^6+ | only vite-using ember projects are supported</li>
    <li><code>ember-source</code> @ ^6.8+</li>
  </ul>

  It's
  <em>possible</em>
  that other environments and ember-source versions could work, but I don't want to formally spend
  time figuring out how to support them.

  <H2 @id="usage">Usage</H2>

  The following modules are available:
  <ul>
    <li><code>import { ... } from "ember-repl";</code></li>
    <li><code>import { ... } from "ember-repl/test-support";</code></li>
  </ul>

  <H3 class="code-link" @id="index-setupCompiler"><code>setupCompiler</code>
    from ember-repl</H3>
  <H3 class="code-link" @id="index-compile"><code>compile</code>
    from ember-repl</H3>
  <H3 class="code-link" @id="index-Compiled"><code>Compiled</code>
    from ember-repl</H3>
  <H3 class="code-link" @id="index-getCompiler"><code>getCompiler</code>
    from ember-repl</H3>

  <H3 class="code-link" @id="index-Format">type
    <code>Format</code>
    from ember-repl</H3>

  <H3 class="code-link" @id="index-Format">type
    <code>CompileState</code>
    from ember-repl</H3>

  This type is the return value from
  <code>compile</code>
  and
  <code>Compiled</code>. The important properties on this type:
  <ul class="poor-mans-typedoc">
    <li><div><code>component</code>
        <span><code>ComponentLike | undefined</code></span>
        <p>
          This is the returned component, if compilation was successful.
        </p>
      </div>
    </li>
    <li><code>error</code></li>
    <li><code>isReady</code></li>
    <li><code>format</code></li>
    <li><code>reason</code></li>
    <li><code>isWaiting</code></li>
    <li><code>promise</code></li>
  </ul>

  <H3 class="code-link" @id="test-support-setupCompiler"><code>setupCompiler</code>
    from ember-repl/test-support</H3>

  This test utility should be the main one used for your tests, as it configures each test to start
  with a clean environment, clear of the main caches. It does not clear the compile cache by default
  because the same input should always create the same output -- which helps speed up test execution
  for repeat code samples.

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
  beneficial to extract that configuration to a variable for sharing with this test-support version
  of
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
</template>
