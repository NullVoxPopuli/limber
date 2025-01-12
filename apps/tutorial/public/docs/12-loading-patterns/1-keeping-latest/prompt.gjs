import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

import { use, resource } from 'ember-resources';
import { RemoteData, remoteData } from 'reactiveweb/remote-data';
import { keepLatest } from 'reactiveweb/keep-latest';

const { JSON } = globalThis;
const isEmpty = (x) => !x || x?.length === 0;
const urlFor = (id) => `https://swapi.tech/api/people/${id}`;

const PersonInfo = <template>
  <fieldset class="border px-4">
    <legend>{{@person.url}}</legend>
    <pre><code class="language-json">{{JSON.stringify @person null "   "}}</code></pre>
  </fieldset>
</template>;

export default class Demo extends Component {
  @tracked id = 51;
  updateId = (event) => this.id = event.target.value;

  @use request = RemoteData(() => urlFor(this.id));

  // TODO: replace this with the keepLatest utility
  get latest() {
    return this.request.value;
  }

  <template>
    <div id="demo">
      <label>
        Person ID
        <input type='number' value={{this.id}} {{on 'input' this.updateId}}>
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

        {{#if this.request.isRejected}}
          error loading initial data!
        {{else}}
          <pre> ... loading ... </pre>
        {{/if}}

      {{/if}}
    </div>
    <style>
      #demo {
        position: relative; max-width: 30rem;
        border: 1px solid;
        padding: 1rem;
      }
      #demo input { max-width: 6rem; border: 1px solid; padding: 0.5rem 0.75rem; }
      #async-state { display: inline-block; margin-left: 1rem; }
    </style>
  </template>
}
