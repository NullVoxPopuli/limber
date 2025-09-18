import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { trackedObject } from '@ember/reactive/collections';

import highlighted from 'limber/modifiers/highlighted';
import { Code } from 'limber-ui';

import type { TOC } from '@ember/component/template-only';

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

const Option: TOC<{
  Args: {
    name: string;
    type: string;
    description?: string;
  }
  Blocks: { default: []}
}> = <template>

  <div class="limber__docs__option">
    <h3>{{@name}}</h3>

    <pre><code>{{@type}}</code></pre>

    <p>
      {{#if @description}}
        {{@description}}
      {{else}}
        {{yield}}
      {{/if}}
    </p>
  </div>
</template>;

class Example extends Component<{
  Args: Record<string, any>;
  Blocks: {
    code: [config: Record<string, any>];
    output: [config: Record<string, any>];
  }
}> {
  config = trackedObject<Record<string, any>>({ ...this.args });

  update = (key: string, event: InputEvent) => {
    assert(`[BUG] event needs a target`, event.target instanceof HTMLInputElement);

      const target = event.target;

      if (target.type === 'checkbox') {
        this.config[key] = Boolean(event.target.value);

        return;
      }

    this.config[key] = event.target.value;
  };

get isString() {
return 'editor' in this.config;
}

  get isNumber() {
    return 'lines' in this.config;
  }

  get isBoolean() {
    return 'forceEditor' in this.config;
  }

  <template>
    <div class="limber__docs__option__example">
      <div class="label">
        <label>
          {{#if this.isNumber}}
            <span><code>@lines</code></span>
            <input
              type="number"
              required
              value={{@lines}}
              {{on 'input' (fn this.update 'lines')}} />
          {{else if this.isBoolean}}
            <span><code>@forceEditor</code></span>
            <input
              type="checkbox"
              required
              checked={{@forceEditor}}
              {{on 'input' (fn this.update 'forceEditor')}} />
          {{else if this.isString}}
            <span><code>@editor</code></span>
            <input
              required
              checked={{@editor}}
              {{on 'input' (fn this.update 'editor')}} />
          {{/if}}
        </label>
      </div>
      <div class="code">{{yield this.config to="code"}}</div>
      <div class="output">{{yield this.config to="output"}}</div>
    </div>
  </template>
}

<template>
  <h1>Embedding</h1>

  The REPL can be embedded via invocation of the <code>Code</code> component.

  <div data-format="gjs" {{highlighted EXAMPLES.basic}}></div>

  Output:
  <Code @code={{counter}} />

  The <code>Code</code> component interprets and configures the URL set on the iframe that loads the REPL.

  <section class="options">
    <h2>Options</h2>

    <Option @name="@code" @type="string">
      This is the code that both shows up in the editor and is rendered in the output pane. By default the format is gjs, so the passed code should be written in gjs.
    </Option>

    <Option @name="@editor" @type="boolean">
      Set the editor size and/or split. For example passing <code>min</code> will minimize the editor, and passing <code>max</code> will maximize the editor. Also, the percent of the vertical or horizontal direction can be specified as well. For example, passing <code>60v</code> will cause a vertical split where the editor takes up 60% of the available space and <code>30h</code> will cause a horizontal split where the editor takes up 30% of the available space.

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
      Sets the <code>title</code> attribute on the iframe. If <code>@title</code> is not passed, this value will be generated for you. Helps with screen readers.
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
</template>;
