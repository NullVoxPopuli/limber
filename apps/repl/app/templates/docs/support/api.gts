import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { trackedObject } from '@ember/reactive/collections';

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

export class Example extends Component<{
  Args: Record<string, any>;
  Blocks: {
    code: [config: Record<string, any>];
    output: [config: Record<string, any>];
  };
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
      <div class="code">{{yield this.config to="code"}}</div>
      <div class="output">{{yield this.config to="output"}}</div>
    </div>
  </template>
}
