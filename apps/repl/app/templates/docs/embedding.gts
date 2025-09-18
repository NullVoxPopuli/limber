import highlighted from 'limber/modifiers/highlighted';
import { Code } from 'limber-ui';

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
  <REPL @code="..." @editor={{${editor}}} />
</template>`,
};

<template>
  <h1>Embedding</h1>

  The REPL can be embedded via invocation of the
  <code>Code</code>
  component.

  <div data-format="gjs" {{highlighted EXAMPLES.basic}}></div>

  Output:
  <Code @code={{counter}} />

  The
  <code>Code</code>
  component interprets and configures the URL set on the iframe that loads the REPL.

  <section class="options">
    <h2>Options</h2>

    <Option @name="@code" @type="string">
      This is the code that both shows up in the editor and is rendered in the output pane. By
      default the format is gjs, so the passed code should be written in gjs.
    </Option>

    <Option @name="@editor" @type="boolean">
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

      <Example @editor="30h" @name="editor">
        <:code as |config|>
          <div data-format="gjs" {{highlighted (EXAMPLES.editor config.editor)}}></div>
        </:code>
        <:output as |config|>
          <Code @code={{hello}} @lines={{config.editor}} />
        </:output>
      </Example>
    </Option>

    <Option @name="@title" @type="string">
      Sets the
      <code>title</code>
      attribute on the iframe. If
      <code>@title</code>
      is not passed, this value will be generated for you. Helps with screen readers.
    </Option>

    <Option @name="@lines" @type="number">
      Sets the height of the iframe via specifying the number of lines of code to show.

      <Example @lines={{4}} @name="lines">
        <:code as |config|>
          <div data-format="gjs" {{highlighted (EXAMPLES.lines config.lines)}}></div>
        </:code>
        <:output as |config|>
          <Code @code={{hello}} @lines={{config.lines}} />
        </:output>
      </Example>
    </Option>
  </section>
</template>
