import { ExternalLink } from 'limber-ui';

import highlighted from '../../modifiers/highlighted';
import {
  CodeBlock,
  example,
  exampleMermaid,
  H2,
  H3,
  issueURL,
  sample,
  TryIt,
} from './support/code.gts';

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

  In javascript-like languages and formats (or that have a javascript-like section of their format),
  may import from anywhere. This includes NPM, CDNs, etc. Bare specifiers, such as in
  <code>import { ... } from 'package-name';</code>
  will reach out to NPM to download the tarball using the
  <code>latest</code>
  tag and extract its contents. This behavior can be changed by adding more to the import path.

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

  <article>
    <header>
      <H3 @id="supported-markdown" @text="Markdown" />
      <TryIt
        href="/edit?c=MQAgggNhILYIYCcDWATA9gdwHYgQUyxTwTgCMI8BnEAKBoFoQBtAURlOIF0AKYPd4gEoGzAMoA3PBAAueHsEqSZeYYyYA1AK5ze47auYBZYvACWKeTBNxzBpgCU8cAMbT5%2BF9OE1goNhwQ6GgADUIBzACtqCFNJGlMYAAc0BGkQAGE0JLQsAjSAMwQskAByAAEwmJgrBAB6Zyzk3KxpEoBueOzUkABvEGkSZyQ8FBAAXxBC4vLKhJragZckUyww9s7k7r6c8cmimFKy-gDamDQUU3zTYnWaPAAPTbSifLhNGRBnCDhKagAJKQQNAAdRSEFGD1khGomWyzTSPRoIBAZUWQxGnzQmhaIAAvCAAAwdZErZz4Kw4-HcQR4gB8-QAFqZKAA6BrY6QAak5xJARDJ-DyeJA1LpjOZbKxLXo9A6SJAAB5ZElvrJafLkQrErTMhyAFy9HrSJms9ktMZjBW1bV0ZGa0iaaTSHY9Ho7ABEX1MQ3d4tZpPJeQttIAklgBRTpFaHU6cuq7YqY86cK6PV6fX6WfzA%2BaxrSACJ4CN5aOO5PxxULfiJVV4dVjEKhIIKojSGwQSi0hWUTTVRAAT1pkFkCCwcFkkxS8DSxvHIAezOk1ByEH7IBWfpA9hYAAUADJWnt9hCDuihYIM0jUY7EEAxOIK94V118FwMkWIEj9jUihk-d8Mvg%2BS4iUDJOoklB6rUtQ3ggUSSjAJT9JCIH%2BLeDJZHgICJHAYR4CUwgJtwf6UABQEgWB0gQVBtRhKYxqaKQCG1Fg7wQOIaCPGgiTvKYSGyPc0ggYYa4AOL0X8jEET%2BxH-iAgF4MBoHgZB0HSBg9EjsxrFQBxXE8TE-EoSUIkgAAKhpTo3IRIA0j8IAAD6UPReAORaP4KjEFYJgqcDyeRrrObILIKfkFr9IgeFCe6AD65BwFgSDurSgUuSyAnSBaVpwN5lZefKrowW%2B7lWk%2BjbBHQVqtu2nZ0L4IASFIshnqEihNVh954DQ3ZkqYiTSOqACQFBpOIcAQNowoACSUG2sjcASggdIevX9eq3XarqLQGj0Y0TXglrWutCpJjsOTpkguI9KKuL0ntk2cviACMeZhsWLSlrGWDqidZZneGMRDFdN13eNk30M9eaFu9Ua1Kd33lXVoBaF15V6B1sRdT1CB9WklB4NImg2iSXQIrgim7FMBwlOjJS2piWCzZiHLCkBC3CCtONrZVyo1uOdbylqOpStIO19GaaRZUd9O-V9KIXbinoi9yyVvTmsPwxWsvJvLgOXUrHIysl0Pq595bdVWKr8%2Bq55IyAxgIGYKAtcENROwwMo0A0WBXGEeo-sixqCga%2BAoJo9we-QND5ECGDOH%2B3RmfmAd2mA3BMO6ohtqk7qcDZCbImAIAyvSABCPTutDzKmDk7oNgXdql8X9D0ukGcAPL9TXOBgLnKfIk3JcgPmHddzspd97bPigI4nhBOeUT3OTnh3pjGwpGks%2BuAANL0ICaPjWf85T%2BylB4rjtMidD5NirjdxkIvEKKfS0Mi3tM0wEu7-j0hbW4woHzwEfeai02hX3lO-NIAZBSUhFDSW6IAf5-24NwRI%2BBxB-3gfSNBeAMEixAJyEAT0lpXzfjkJm2YYFpCpFgxBBNkGoPQZgsUOC8Es0YMQsBtB5T4EJqOEUpC7QKlypqTaIsdoS0OsTAu2t-rpD1ldaBkZXrhlNnDP631BE%2BXhiAHI8jvSXR6JQ5RBYixqM1loysFYlo0AmHQB4Tw%2BSKTeB8BUf9by1FpFwxGNAgA&format=md"
      />
    </header>

    The markdown support here uses the
    <ExternalLink href="https://unifiedjs.com/">unified</ExternalLink>
    ecosystem's
    <ExternalLink href="https://remark.js.org/">remark</ExternalLink>
    and
    <ExternalLink href="https://github.com/rehypejs/rehype">rehype</ExternalLink>. By default, it
    uses
    <ExternalLink href="https://github.com/remarkjs/remark-gfm">GitHub-flavored Markdown</ExternalLink>
    as well as header-auto-linking. Docs for GitHub-flavored Markdown
    <ExternalLink
      href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
    >can be found here</ExternalLink>. Code fences can be extracted and rendered as live-demo
    regions via using the
    <code>live</code>
    metadata on a codefence (if required by the language -- which is currently all of them except
    mermaid). Example:
    <ul>
      <li>for gjs
        <CodeBlock @code={{example}} />
      </li>
      <li>for mermaid
        <CodeBlock @code={{exampleMermaid}} />
      </li>
    </ul>
  </article>

  <article>
    <header>
      <H3 @id="supported-ember-gjs" @text="Ember GJS" />
      <TryIt
        href="/edit?c=JYWwDg9gTgLgBAYQuCA7Apq%2BAzKy4DkAAgOYA2oI6UA9AMbKQZYEDcAUKJLHAN5wwoAQzoBrdABM4AXzi58xcpWo1BI0cFQk2nFD35oZcvCEJF0IAEYqQECcGzBqO9ugAe3eBPTYhAVzJ4OjIhAGdQuAAJdDIyCAB1aDIpdxhMCQikFGZ4XnY4OCI1MUk4Bj8sOABeOAAGDny4TTooC0x4GoAKAEpqgD4BAAtgUIA6csqAahqARgaCgB408BC0vsbFsD6ATQg-OEGhADd0MooSqRhB08s-GBhDXl4rkfG9rGlZGFB0MYWaLbsDZwBa3e6GGAATzA6CqACIwQ9UHC%2BLxDHDgsAxCiXmNmq0qB9pH0EOdRP9EWh1otVBYwKt0OtpOwgA&format=gjs"
      />
    </header>

    <code>.gjs</code>
    is the standard component file format for
    <ExternalLink href="https://emberjs.com/">emberjs</ExternalLink>. It should function exactly as
    you'd be used to in your local ember projects.
    <br /><br />
    if GJS is new to you, you may find more information on it
    <ExternalLink href="https://guides.emberjs.com/release/components/template-tag-format/">here, on
      the official docs</ExternalLink>
    and via
    <ExternalLink class="m-0" href="https://tutorial.glimdown.com/">
      the interactive tutorial
    </ExternalLink>
    (which was built using this REPL).

    <br /><br />
    In particular, GJS enables:
    <ul>
      <li>block-scope behavior</li>
      <li>multiple components defined in one file</li>
      <li>test code is ergonomically just as good as app code</li>
    </ul>
  </article>

  <article>
    <header>
      <H3 @id="supported-mermaid" @text="Mermaid" />
      <TryIt
        href="/edit?c=OYJwhgDgFgBAMgJQFA1TAggbQMoEcCuYIApjAsQMYAuAujALT3wCWAdgNYxXEAeVD9AHwwAQgAoxAYWYgKAG2IBKRSjToBwyWIQB7fKwAmZSlRVpRGmABEA3gig6AtgCN8AZwC%2Bq1JMtWkQA&format=mermaid"
      />
    </header>

    <ExternalLink href="https://mermaid.js.org/">Mermaid</ExternalLink>
    is a diagramming and charting tool. It supports a vast variety of different chart types is a
    very useful tool for aiding in bringing visualizations to markdown-based documentation.
  </article>

  <article>
    <header>
      <H3 @id="supported-svelte" @text="Svelte" />
      <TryIt
        href="/edit?c=DwZwxgTglgDgLgPgFAEgA2BTOACAdgVwFsAjDCEbAXmwBIQ4BDODACgG0BGAGmwCYeAzDwAsAXQCUAblSYccAPaM0VWgBMyUAG4ZVLAiTIgAdBB34wrFnB65xVBNhwBqPDwAM4qUlQAzfLjA4KHlcbAZVVQA5IlIIFjsAb1QUfVjjGHwQAAs9GMMjTFwAczgs7BcOLxQAXyRgAHpwaHhkOpgEBNT8gCt5KFwWAHJy7EHxapUEhSVqhvbvYGJ8OAVQkLA0KDAAa0oE8Ki8iGrkFABBCLC8I7r6pZWQ5CA&format=svelte"
      />
    </header>

    <code>.svelte</code>
    is the standard component file format for
    <ExternalLink href="https://svelte.dev/">svelte</ExternalLink>. It should function exactly as
    you'd be used to in your local svelte projects. As far as REPLs go though, the
    <code>.svelte</code>
    syntax is limited to only one component per file. So more complex usage of Svelte will be
    limited until multi-file support is added to this REPL.
  </article>

  <article>
    <header>
      <H3 @id="supported-vanilla-js" @text="Vanilla JS" />
      <TryIt
        href="/edit?c=JYWwDg9gTgLgBAbzgZwKYDsYYMaoMICGacAvnAGZQQhwDk2AFgegOaoC02RqtA3AFD9UAD0iw4AE1TkCAVwA28crPTYYwCOjhQMUqAApU81CAwwAlIn5w4Rk2YB0WYTDyasmOAF4UZnPm59WgYjeQgAFRCdWnMBEn4gA&format=js"
      />
    </header>

    This mode is a no-frills, "just use JavaScript" mode. You are given an element and are free to
    manipulate that element however you wish.

    <div
      data-format="javascript"
      {{highlighted
        "export default function render(element) {
  element.textContent = 'hello there';
}"
      }}
    ></div>
  </article>

  <article>
    <header>
      <H3 @id="supported-vue" @text="Vue" />
      <TryIt
        href="/edit?c=DwZwxgTglgDgLgAhAUzgVxgPgFAIVAWxgHsJEBvBCZAMwQF8EaJiCEByANzWXe1wRhiAOxCIwCALxVaACgAMASgFDRiOtOo1ZAZgBMygTTTCwcKCKSoAwrOQAaBJykIA1MgB0cAIYQA5qgenN4ANjyKCOQCeGBBoTwunNFMcWHILiwmACayzgBUCLIAnAgA9AgArBGuCPrKePT8eMam5pYocABido7O0u5evgFwqeGRyTSj6dJJeDFTGcTZsrkIALS1BggFshVlCEWK9QxNTCZmFsJUS8I5whFRczLoEFcAst5wABYembeyVwKAEYlPsQQBuASNYClcDQeA4bDAODIIghT7IHB4YBQYQwNCIOAATxgyEkACJhGgCAAjZAQckIABcwTSFLAjIAAmAvt5hAEKR1rOTMAhrMgQiAoGgQFIBDi8QSEMTSRSqbT6YyWfEyeSaFyeXyBeSOp0RQhOt4vtRhF9kFA4EjSii0RicEA&format=vue"
      />
    </header>

    <code>.vue</code>
    is the standard component file format for
    <ExternalLink href="https://vuejs.org/">vue</ExternalLink>. It should function exactly as you'd
    be used to in your local vue projects. As far as REPLs go though, the
    <code>.vue</code>
    syntax is limited to only one component per file. So more complex usage of Vue will be limited
    until multi-file support is added to this REPL.
  </article>
  <article>
    <header>
      <H3 @id="supported-react-jsx" @text="React JSX" />
      <TryIt
        href="/edit?c=JYWwDg9gTgLgBAJQKYEMDG8BmUIjgcilQ3wG4AoUSWOAbzgBUIUBnGAYQgDsYVgukUADRwYzNnAC%2BcbLgJF0MALRjWMYJgCeZcuUwBXLhmDc4AESQgIACgCUdcnDhpuErhHVa4AXjh2fAHyi4jDWAEQA6hAA7nAsEHCoLJoAhGG2FI5wRDD6UFx%2BWU4APAAmwABuAUVOcMUARvowYgXc7AA2wGgA1t607p6aktW1o3AAch4aqTUlAPSNzdwjY8VMapw8fAJQcHMr8%2BVVWRnkkrpIAB7U8KVImCj67fDFFlZ7ARRAA&format=jsx|react&shadowdom=0"
      />
    </header>

    <code>.jsx</code>
    is the stand component file format for
    <ExternalLink href="https://react.dev/">react</ExternalLink>. It should function exactly as
    you'd be used to in your local react projects. In particular,
    <ul>
      <li>block-scope behavior</li>
      <li>"infinite" nesting of JSX -> JS -> JSX -> etc expressions</li>
      <li>test code is ergonomically just as good as app code</li>
    </ul>
  </article>
  <article>
    <header>
      <H3 @id="supported-ember-hbs" @text="Ember HBS" />
      <TryIt
        href="/edit?c=DwVwNgfAUABDDe8DEBTAhgYwBYwBRoCcC0BPWOPLNAZxywJQDMBeAciwBcOAHagLgD0AlAFsARigIAragDoMAexGsYHFAA8ObAKLjJMLEpQxuaAOYpWASnJxcVWgYYt2XXoIFmAlhywgx8koCAHbgYABuCurcCtzgXipqmmwAsiQwAOI%2BABL%2B1raUNHTObJw8-EIcAO4%2BagSBIiFhkdGx8YkaWqxpMAAqNVyS%2BXBWMDQwAD7UPigTAL5zBcBgXtAUFMBoBev0TMyI02qyu4wL2xQchBZaAEQA%2BmJgaMEA1jfncAxgzDfBCrEoYL6P7OSQMAg3CAHGayJIcBbAARoNYbAQrFGIYSYLBnRHgaBQKAAESYaHAHBgZjACjEaDA1BgXmCqiwXgZACVtAAFAAyMEUwUYXjMIAYABMYIwFAQWWzVKJuE8KSIFGKUHxCaBIORlqtCMQSIj0Tr0QKMGgOEbVibVoxglaUbqINcHTaIA4sK64E6FPa0dbvcb1psnHsbmV3EJvL5-A1hHppNQBLSJGAALSKkDeYJp0QSAhptQiRUWlBpxTFrxKry%2B5PUsQCERoJkCagEDCtxTcMvU8302HUJA8gCMADZIXSwGMwNSqigJQApADKlPrdOoiOROv90DxkCAA&format=hbs&shadowdom=0"
      />
    </header>

    <code>.hbs</code>
    is a legacy format of Ember, and is not used in new projects. This version of
    <code>.hbs</code>
    is not exactly that legacy version, but is more a the "template region" of modern ember
    components -- in that all referenced invokables are strictly defined (hard-coded as far as the
    REPL is concerned). This mode somewhat acts like
    <code>HTML</code>, but with extra dynamic capabilities. The invokables that are in scope for
    <code>.hbs</code>
    in this REPL are:
    <ul>
      <li>The standard scope,
        <ExternalLink
          href="https://github.com/emberjs/babel-plugin-ember-template-compilation/blob/main/src/scope-locals.ts#L16"
        >defined by RFC #1070</ExternalLink></li>
      <li>array</li>
      <li>concat</li>
      <li>fn</li>
      <li>hash</li>
      <li>on</li>
    </ul>
  </article>
  <article>
    <header>
      <H3 @id="supported-glimdown" @text="glimdown" />
      <TryIt
        href="/edit?c=MQAg6gpgNgxg9gWwgQgFCoDwAcQygQwGdCBeAIgAsBLAExogDsRCEAuAIyjhgGsyA%2BVCBABlaBBgAXEPQRxCIAGYAnRCEkUIIJAwCuIKkw1bN%2BespBwLAd2VVJWgJ5xdFuNaYxdhSWvgMHAJB8BhpmCnxlLXsQa3sKS2NlQmQQQBNyQHg-zAB6LEFUACoCgDkAeQAVAFFWIvU4dXx2S11pOEV1TRAIGnsrABolKmTpLCjiDq0IQhh8LC0eCEcAOnRy6gUAJUqABQAZZl0sLCtJBWMlOCguOIYAc1Z0AB8QABEIORBnl%2B4FR9RngC0QOBIJBnxAoMhn3%2BIAA2iIAG7QBwAXVhhCRUAcANkcBR4PRmIcS3oCLRNB%2BAIxyIg%2BMA6YQw2EANV0tNhCNZOPeeIJHIgACtCEsrLdyZS%2BfSYRsIPgpCAABSwwUADzRKoBUVlki5chRAEoCZqpCSIGTYRSYIQNTKpJLnpUEOwIBZFbdBWi3Vb3k7lDq8QNYRR2IQ0UGvY7nX79QTvc7BUt4AgxZaAbHlHa4QBZZ0IfC0NFIZS52hRgmF4s0JbxkXJq3lvM0DOwzORHgUjwFmiluIaEBQKhIgyEAihX5wgACIAA4vYABK6di1gG55Rt9wMJtT-sIdsb2G3Hel%2BUaKgKC0Gv6FAq3be72rZbLCAD6Dp9lgsW6oCELICioWd3SxPE2itruT7oBgFDKPkhI0lGrAgNkAD8ihWLmkgkNSWIQAAZIoVBQBAJDZIQ%2BAIFghGECRRIQH6SxYQ4qDspyuIoghyGoUW%2BAYXyeEEURJFkRRUzZHydF8kx6pGtqrHsShaHcSQKqPNJfGEcRpHkZR2RSTaMnclWhDKjhhARO2FIICQij4FAhAQExnqphGvqyYh8lcRhnpqQJmnCVRjm4ksnpMWGTk%2BvBbmcehJBho8abeRpQnaaFgVhkx9Ylq5HEKRhGU0AlglaSJeV0Xl6Vdll7nRTuBW%2BdpNlQEsO4OYeWXoOalIMbSCEUJIkhYIQrAPl1JoItkTEWlaEo9X1A1DaJrLVsotzjR1KbSWxIC9f1g0PtJo2rZNYXOpt21zQ%2Babxomh2Unlp2zbt2R5YZwrLTdKYrmuHYzTt82TUF8QLgmiDZIw2S3BA2o%2BJEDg0Nktj2IYtwAnADAArcgPsODkOSEjVKSDD3QAj2FDE3YuN3ACIRdlF3EU8jqPo5j2TsEQVAwGTiOU9TAK031eOEI4AT4Mq6DAKAn47uu6AiIgWg3nArNXI4wQInmBCcFo8qjN0ED4Qw3QGoougMFIVCowoMxME6BgMAicALGEhggDeX67gMnFdMqSUQAM3hIyAAAGkTKPgjiB8EoRBxEpmBw8qC7KerTtP2DA8INmC6FAgjCAA3rnwA2gk8oh2HQjCAqMcJFBeskAA5Gdj2XUKiZ1%2BoEDKhhdevs6W1yyAWD4BDdd6uXwjylXW1RIo9eN-NGMaED116Fc9vKscWBZ1QbcOJ39eZirM6SPO7Aj2PldENX0%2Bzw982SD2DjKMDCDZCvUBrxvW87x3XcHyA5QP2dGfYQBoiCfEIPYCAjwAC%2B0Dz4YH7DnCuwgMD4CnrXfOEDiQ10ULAhoy1IbkCfJwEIfB%2BCYMgUsXekhYEYGyPgJBKDsiIPLvnUGsoKCwJyFnfIaxTx9iTkOEA3hIz%2BHwrcVwjRCIgARFQfADxA6KMFKgL8xxlDSFzswSGhwADCiAsD8QsNApQqgEAgDrmma0FE64AG50APhAEsJx6A7KSF0fowxx51gDFzuXOAWBcYWwQr45BB4aDBPPsIaY-iIAROQcghxzhXDMHgHMYIdBEYWy2gBSJIBoF9HPvk8uRS9R2MUYHdqABGe6v0HwLwoEvEGrtvxxn8tuQsqZ17Oi-IwAmUBsiSCiBAJ6RBH65FlDwIeIkO4%2ByohRMOtxVAmxoExAATDU864NMbP1Bs5AEDgtLcVoqok4VFLEHPmdiE56jCBMQAMwbMevUxpL9ihZygEyOAyptj%2BK3swr8PpsinkIKyKilSAAs6AgA&format=gmd&shadowdom=0"
      />
    </header>
  </article>

  glimdown or
  <code>gmd</code>
  is the glimmer-flavored-markdown language format for aiding in creating documentation with
  highlighted and interactive code blocks.

  <br /><br />
  It differs from markdown in that it supports some light
  <code>\{{ }}</code>
  regions within the markdown space, without needing to create a code fence.

  <br />
  <br />
  When in glimdown mode, code fences can be used to live-render components via metadata tags as well
  as render the code snippet the live code comes from.

  <CodeBlock @code={{sample}} />

  <MetadataTags />

  All supported languages and formats can be used in the codefence blocks. Example for live gjs
  <CodeBlock @code={{example}} />

  Example for live mermaid
  <CodeBlock @code={{exampleMermaid}} />
  Mermaid has an implicit "live" metadata.

  <hr />

  For any issues / questions, please file an
  <IssueLink />.
</template>
