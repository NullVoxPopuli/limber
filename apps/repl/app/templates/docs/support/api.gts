import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { trackedObject } from '@ember/reactive/collections';

import highlighted from 'limber/modifiers/highlighted';
import { Code } from 'limber-ui';

import type { TOC } from '@ember/component/template-only';

export const Option: TOC<{
  Args: {
    name: string;
    type: string;
    description?: string;
  };
  Blocks: { default: [] };
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

const allowed = new Set([
  // 'code', // handled separately
  'lines',
  'clickToLoad',
  'editor',
  'format',
  'title',
  'forceEditor',
  'shadowdom',
  'nohighlight',
]);

function allow(object: Record<string, any>) {
  return Object.fromEntries(Object.entries(object).filter(([key]) => allowed.has(key)));
}

export class Example extends Component<{
  Args: {
    code: string;
    configurable?: boolean;
  } & Record<string, any>;
  Blocks: {
    code: [config: Record<string, any>];
    output: [config: Record<string, any>];
  };
}> {
  config = trackedObject<Record<string, any>>(allow(this.args));

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

  get code() {
    const begin = `<REPL`;
    const end = '/>';
    const body = [];

    const entries = Object.entries(this.config);

    for (let [key, value] of entries) {
      if (key === 'code') {
        value = '...';
      }

      if (typeof value === 'string') {
        value = `"${value}"`;
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        value = `{{${String(value)}}}`;
      }

      body.push(`@${key}=${value}`);
    }

    return (
      begin +
      (body.length > 1
        ? '\n' + body.map((x) => `\n  ${x}`).join('')
        : body.map((x) => ` ${x}`).join('')) +
      ' ' +
      end
    );
  }

  get isConfigurable() {
    return this.args.configurable ?? true;
  }

  get withDefaults() {
    return {
      lines: 5,
      ...this.config,
    };
  }

  <template>
    <div class="limber__docs__option__example" data-configurable={{String this.isConfigurable}}>
      {{#if this.isConfigurable}}
        <div class="label">
          <label>
            {{#if this.isNumber}}
              <span><code>@lines</code></span>
              <input
                type="number"
                required
                value={{@lines}}
                {{on "input" (fn this.update "lines")}}
              />
            {{else if this.isBoolean}}
              <span><code>@forceEditor</code></span>
              <input
                type="checkbox"
                required
                checked={{@forceEditor}}
                {{on "input" (fn this.update "forceEditor")}}
              />
            {{else if this.isString}}
              <span><code>@editor</code></span>
              <input required value={{@editor}} {{on "input" (fn this.update "editor")}} />
            {{/if}}
          </label>
        </div>
      {{/if}}
      <div class="code">
        {{yield this.config to="code"}}
        <div data-format="hbs" {{highlighted this.code}}></div>
      </div>
      <div class="output">
        <Code
          @code={{@code}}
          {{! Optional: }}
          @lines={{this.withDefaults.lines}}
          @editor={{this.config.editor}}
          @format={{this.config.format}}
          @title={{this.config.title}}
          @forceEditor={{this.config.forceEditor}}
          @shadowdom={{this.config.shadowdom}}
          @nohighlight={{this.config.nohighlight}}
          @clickToLoad={{this.config.clickToLoad}}
        />
      </div>
    </div>
  </template>
}
