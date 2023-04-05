import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

import { use, resource } from 'ember-resources';
import { RemoteData, remoteData } from 'ember-resources/util/remote-data';
import { keepLatest } from 'ember-resources/util/keep-latest';

const isEmpty = (x) => !x || x?.length === 0;
const urlFor = (id) => `https://swapi.dev/api/people/${id}`;

const PersonInfo = <template>
  <fieldset class="border px-4">
    <legend>{{@person.url}}</legend>
    <pre><code class="language-json">{{JSON.stringify @person null "\t"}}</code></pre>
  </fieldset>

</template>;

export default class Demo extends Component {
  @tracked id = 51;
  updateId = (event) => this.id = event.target.value;

  @use request = RemoteData(() => urlFor(this.id));
  @use latest = keepLatest({
    value: () => this.request.value,
    when: () => this.request.isLoading,
  });

  <template>
    <div class="border p-4 grid gap-4" id="demo">
      <label>
        Person ID
        <input
          type='number'
          class='border px-3 py-2'
          value={{this.id}}
          {{on 'input' this.updateId}}
        >
      </label>


      {{! We either have an initial value, or we don't }}
      {{#if this.latest}}

        <div id="async-state">
          {{! Async state for subsequent requests, only}}
          {{#if this.request.isPending}}
             ... loading ...
          {{else if this.request.isRejected}}
             error!
          {{/if}}
        </div>

        <PersonInfo @person={{this.latest}} />
      {{else}}
        {{! This block only matters during the initial request }}

        {{#if this.rejest.isRejected}}
          error loading initial data!
        {{else}}
          <pre> ... loading ... </pre>
        {{/if}}

      {{/if}}
    </div>
    <style>
      #demo { position: relative; }
      #async-state { position: absolute; right: 0.25rem; top: 0.25rem; }
    </style>
  </template>
}
