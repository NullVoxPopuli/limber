import highlighted from 'limber/modifiers/highlighted';
import { Code, ExternalLink } from 'limber-ui';

import { Example, Option } from './support/api.gts';

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
  basic: `import { REPL } from 'limber-ui';

<template>
  <REPL @code="..." />
</template>`,
  lines: (lines = 4) => `import { REPL } from 'limber-ui';

<template>
  <REPL @code="..." @lines={{${lines}}} />
</template>`,
  editor: (editor = 4) => `import { REPL } from 'limber-ui';

<template>
  <REPL @code="..." @editor="${editor}" />
</template>`,
};

<template>
  <h1>Embedding</h1>

  The REPL can be embedded via invocation of the
  <code>Code</code>
  component.

  <div data-format="gjs" {{highlighted EXAMPLES.basic}}></div>

  Output:
  <Code @code={{counter}} @editor="60h" />

  The
  <code>Code</code>
  component interprets and configures the URL set on the iframe that loads the REPL.

  <section class="options">
    <h2>Options</h2>

    <Option @name="@code" @type="string">
      This is the code that both shows up in the editor and is rendered in the output pane. By
      default the format is gjs, so the passed code should be written in gjs.
    </Option>

    <Option @name="@format" @type="string">
      This is the format that the REPL should both render and load the editor for.
      The default is "gjs", but valid options are:
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
      By default, the REPL will load when its dimensions approach the viewport (<ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#lazy">via loading=lazy</ExternalLink>). Setting <code>@clickToLoad</code> will require user interaction before loading the iframe.
      <br>
      <br>

      The UI for click to load has stable CSS classes available for customization. <code>.limber__code__click-to-load</code> and <code>.limber__code__click-to-load__button</code>

      <Example @name="clickToLoad" @clickToLoad={{true}} @code={{hello}} />
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

      <Example @editor="30v" @name="editor" @code={{hello}} />
    </Option>

    <Option @name="@editorLoad" @type="string">
  Determines how the editor should load. Normally the editor will load automatically upon detecting interaction activity. This is to optimize page-load as editors can be a few MB when fully featured.

    Valid options:
    <ul>
    <li>
      "force" - the editor will always load eagerly
    </li>
    <li>
      "onclick" - the editor will only load when the user clicks that they want to edit the example
    </li>
    <li>
      "never" - the editor is entirely disabled and the left-hand side is only a highlighted code snippet as is not editable
    </li>
  </ul>
</Option>

    <Option @name="@lines" @type="number">
      Sets the height of the iframe via specifying the number of lines of code to show.

      <Example @lines={{4}} @name="lines" @code={{hello}} />
    </Option>

    <Option @name="@title" @type="string">
      Sets the
      <code>title</code>
      attribute on the iframe. If
      <code>@title</code>
      is not passed, this value will be generated for you. Helps with screen readers.
    </Option>

    <Option @name="@shadowdom" @type="boolean">
      Sets whether or not the output area should be rendered within a shadow-dom.
      The default is to render the output in a shadow-dom (true).
      <br>
      <br>
      Changing this can be helpful if importing a library only knows how to mutate the document's head (for styles or otherwise)
    </Option>

    <Option @name="@nohighlight" @type="boolean">
      If set to true, the preview code shown before the editor loads will not have highlighting enabled.

      This option has no affect when the editor is forced to eagerly load.
    </Option>

  </section>
</template>
