import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { trackedObject } from '@ember/reactive/collections';

import { Form } from 'ember-primitives/components/form';

import highlighted from 'limber/modifiers/highlighted';
import { Code } from '@nullvoxpopuli/limber-shared';

import type { TOC } from '@ember/component/template-only';

export const Live = <template>
  <span class="tag-label" aria-label="live" style="display: inline-block">⚡ live</span>
</template>;
export const Refresh = <template>
  <span class="tag-label" aria-label="Refresh" style="display: inline-block">🔃 reload</span>
</template>;

export const Option: TOC<{
  Args: {
    name: string;
    type: string;
    description?: string;
    live?: boolean;
  };
  Blocks: { default: [] };
}> = <template>
  <div class="limber__docs__option">
    <h3>{{@name}} {{#if @live}}<Live />{{else}}<Refresh />{{/if}}</h3>

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
  'editorLoad',
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

  update = (newValues: Record<string, unknown>) => {
    if (typeof newValues !== 'object') return;

    for (const [key, value] of Object.entries(newValues)) {
      if (this.config[key] !== value) {
        this.config[key] = value;
      }
    }
  };

  get isEditor() {
    return 'editor' in this.config;
  }

  get isLines() {
    return 'lines' in this.config;
  }

  get isForceEditor() {
    return 'forceEditor' in this.config;
  }

  get isEditorLoad() {
    return 'editorLoad' in this.config;
  }

  get code() {
    const begin = `<REPL`;
    const end = '/>';
    let body = [];

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

    body = body.map((x) => x.trim()).filter(Boolean);

    const result =
      begin +
      (body.length > 1 ? body.map((x) => `\n  ${x}`).join('') : body.map((x) => ` ${x}`).join('')) +
      ' ' +
      end;

    return result;
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
        <Form @onChange={{this.update}}>
          <div class="label">
            {{#if this.isEditorLoad}}
              <fieldset><legend>@editorLoad</legend>
                <label>
                  <span><code>"force"</code></span>
                  <input type="radio" name="editorLoad" value="force" />
                </label>
                <label>
                  <span><code>"onclick"</code></span>
                  <input type="radio" name="editorLoad" value="onclick" />
                </label>
                <label>
                  <span><code>"never"</code></span>
                  <input type="radio" name="editorLoad" checked value="never" />
                </label>
              </fieldset>
            {{/if}}

            {{#if this.isLines}}
              <label>
                <span><code>@lines</code></span>
                <input
                  type="number"
                  name="lines"
                  required
                  value={{@lines}}
                  {{on "input" (fn this.update "lines")}}
                />
              </label>
            {{/if}}

            {{#if this.isForceEditor}}
              <label>
                <span><code>@forceEditor</code></span>
                <input
                  type="checkbox"
                  name="forceEditor"
                  required
                  checked={{@forceEditor}}
                  {{on "input" (fn this.update "forceEditor")}}
                />
              </label>
            {{/if}}

            {{#if this.isEditor}}
              <label>
                <span><code>@editor</code></span>
                <input
                  required
                  name="editor"
                  value={{@editor}}
                  {{on "input" (fn this.update "editor")}}
                />
              </label>
            {{/if}}
          </div>
        </Form>
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
          @editorLoad={{this.config.editorLoad}}
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
