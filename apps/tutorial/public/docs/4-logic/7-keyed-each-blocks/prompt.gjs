import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';

let planets = [
  { id: 1, name: 'Tatooine' },
  { id: 2, name: 'Alderaan' },
  { id: 3, name: 'Yavin IV' },
]);

export default class Demo extends Component {
  <template>
    <ul>
      {{#each this.planets as |planet|}}
        {{ (this.iterated planet) }}
        <li>
          {{planet.name}}
          <button type="button" {{on 'click' (fn this.remove planet)}}>remove</button>
        </li>
      {{/each}}
    </ul>
    <button type="button" {{on 'click' this.add}}>
      add data
    </button>
  </template>

  @tracked planets = planets;

  iterated = (planet) => console.log(planet.name);

  add = () => {
    this.planets = [...this.planets, { id: this.planets.length, name: 'Hoth' }];
  }

  remove = (planet) => {
    this.planets = this.planets.filter((p) => p.id !== planet.id);
  }

}
