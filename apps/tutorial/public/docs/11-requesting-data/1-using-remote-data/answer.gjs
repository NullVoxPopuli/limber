import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

import { RemoteData } from 'reactiveweb/remote-data';

const urlFor = (id) => `https://swapi.dev/api/people/${id}`;

const Person = <template>
  {{#let (RemoteData (urlFor @id)) as |request|}}
    {{#if request.isLoading}}
      ... loading {{@id}} ...
    {{else if request.value}}
      {{request.value.name}}
    {{/if}}
  {{/let}}
</template>

export default class Demo extends Component {
  @tracked id = 51;
  updateId = (event) => this.id = event.target.value;

  <template>
    <div class="border p-4 grid gap-4">
      <Person @id={{this.id}} />

      <label>
        Person ID
        <input
          type='number'
          class='border px-3 py-2'
          value={{this.id}}
          {{on 'input' this.updateId}}>
      </label>
    </div>
  </template>
}
