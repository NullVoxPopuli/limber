import highlighted from 'limber/modifiers/highlighted';

import { ExternalLink, REPL } from '@nullvoxpopuli/limber-shared';

import { Example, Live, Option, Refresh } from './support/api.gts';
import { H2 } from './support/code.gts';

const hello = `<template>
  hello world
</template>`;
const counter = `import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class HelloWorld extends Component {
  @tracked count = 0;

  increment = () => this.count += 1;

  <template>
    <p>You have clicked the button {{this.count}} times.</p>

    <button type="button" {{on "click" this.increment}}>Click</button>
  </template>
}
`;

const EXAMPLES = {
  basic: `import { REPL } from '@nullvoxpopuli/limber-shared';

<template>
  <REPL
    @code="..."
    {{! ...options }} />
</template>`,
  lines: (lines = 4) => `import { REPL } from '@nullvoxpopuli/limber-shared';

<template>
  <REPL @code="..." @lines={{${lines}}} />
</template>`,
  editor: (editor = 4) => `import { REPL } from '@nullvoxpopuli/limber-shared';

<template>
  <REPL @code="..." @editor="${editor}" />
</template>`,
};

<template>
  <h1>Embedding</h1>

  The REPL can be embedded via invocation of the
  <code>REPL</code>
  component.

  <div data-format="gjs" {{highlighted EXAMPLES.basic}}></div>

  Output:
  <REPL @code={{counter}} @editor="60h" @editorLoad="force" />

  The
  <code>REPL</code>
  component interprets and configures the URL set on the iframe that loads the REPL.

  <H2 @id="install">Install</H2>

  With your favorite package manager

  <div data-format="bash" {{highlighted "npm add limber-ui"}}></div>
  <div data-format="bash" {{highlighted "pnpm add limber-ui"}}></div>
  (etc)

  <section class="options">
    <h2>Options</h2>

    <p>
      For each option:

      <dl>
        <dt><Live /></dt>
        <dd>changes to this argument will update the REPL (or its container) without a full refresh
          of the iframe</dd>
        <dt><Refresh /></dt>
        <dd>changes to this argument will cause the REPL to fully reload</dd>
      </dl>

      These (both
      <Live />
      and
      <Refresh />) are inverses of each other.
    </p>

    <Option @name="@code" @type="string" @live={{true}}>
      This is the code that both shows up in the editor and is rendered in the output pane. By
      default the format is gjs, so the passed code should be written in gjs.
    </Option>

    <Option @name="@format" @type="string" @live={{true}}>
      This is the format that the REPL should both render and load the editor for. The default is
      "gjs", but valid options are:
      <ul>
        <li>"gjs"</li>
        <li>"js"</li>
        <li>"gmd"</li>
        <li>"svelte"</li>
        <li>"vue"</li>
        <li>"mermaid"</li>
        <li>"hbs|ember"</li>
        <li>"jsx|react"</li>
      </ul>

    </Option>

    <Option @name="@clickToLoad" @type="boolean">
      By default, the REPL will load when its bounding box approaches the viewport (<ExternalLink
        href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#lazy"
      >via loading=lazy</ExternalLink>). Setting
      <code>@clickToLoad</code>
      will require user interaction before
      <em>rendering</em>
      the iframe.
      <br />
      <br />

      The UI for click to load has stable CSS classes available for customization.
      <code>.limber__code__click-to-load</code>
      and
      <code>.limber__code__click-to-load__button</code>

      <Example @clickToLoad={{true}} @editorLoad="force" @code={{hello}} @configurable={{false}} />
    </Option>

    <Option @name="@editor" @type="string">
      Set the editor size and/or split. For example passing
      <code>min</code>
      will minimize the editor, and passing
      <code>max</code>
      will maximize the editor. Also, the percent of the vertical or horizontal direction can be
      specified as well. For example, passing
      <code>60v</code>
      will cause a vertical split where the editor takes up 60% of the available space and
      <code>30h</code>
      will cause a horizontal split where the editor takes up 30% of the available space.

      <Example @editor="30v" @code={{hello}} />
    </Option>

    <Option @name="@editorLoad" @type="string">
      Determines how the editor should load. Normally the editor will load automatically upon
      detecting interaction activity. This is to optimize page-load as editors can be a few MB when
      fully featured. Valid options:
      <ul>
        <li>
          "force" - the editor will always load eagerly
        </li>
        <li>
          "onclick" - the editor will only load when the user clicks that they want to edit the
          example
        </li>
        <li>
          "never" - the editor is entirely disabled and the left-hand side is only a highlighted
          code snippet as is not editable
        </li>
      </ul>

      <Example @editorLoad="never" @code={{hello}} />
    </Option>

    <Option @name="@lines" @type="number" @live={{true}}>
      Sets the height of the iframe via specifying the number of lines of code to show.

      <Example @lines={{4}} @code={{hello}} />
    </Option>

    <Option @name="@title" @type="string" @live={{true}}>
      Sets the
      <code>title</code>
      attribute on the iframe. If
      <code>@title</code>
      is not passed, this value will be generated for you. Helps with screen readers.
    </Option>

    <Option @name="@shadowdom" @type="boolean" @live={{true}}>
      Sets whether or not the output area should be rendered within a shadow-dom. The default is to
      render the output in a shadow-dom (true).
      <br />
      <br />
      Changing this can be helpful if importing a library only knows how to mutate the document's
      head (for styles or otherwise)
    </Option>

    <Option @name="@nohighlight" @type="boolean">
      If set to true, the preview code shown before the editor loads will not have highlighting
      enabled. This option has no affect when the editor is forced to eagerly load.

      <Example @nohighlight={{true}} @code={{hello}} />
    </Option>

  </section>
</template>
