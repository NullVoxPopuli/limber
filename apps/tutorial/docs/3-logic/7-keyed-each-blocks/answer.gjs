import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';

export default class Demo extends Component {
  <template>
    <ul>
      {{#each this.planets key="id" as |planet|}}
        {{ (this.iterated planet) }}
        <li>
          <button {{on 'click' (fn this.remove planet)}}>remove</button>
          {{planet.name}}
        </li>
      {{/each}}
    </ul>

    {{#if (hasMorePlanets this.planets)}}
      <button {{on 'click' this.add}}>
        add
      </button>
    {{/if}}
  </template>

  @tracked planets = withNewIds(planets);

  iterated = (planet) => console.log(planet.name);

  add = () => {
    this.planets = [
      ...this.planets,
      {
        id: this.planets.length + 1,
        ...getPlanet(this.planets)
      },
    ];
  }

  remove = (planet) => {
    this.planets = this.planets.filter((p) => p.id !== planet.id);
  }

}

let planets = [
  { name: 'Tatooine' },
  { name: 'Alderaan' },
  { name: 'Yavin IV' },
  { name: 'Hoth' },
  { name: 'Dagobah' },
  { name: 'Bespin' },
  { name: 'Endor' },
  { name: 'Naboo' },
];

function hasMorePlanets(existing) {
  return existing.length < planets.length;
}

function getPlanet(existing) {
  let remaining = planets.filter((planet) => {
    let alreadyUsed = existing.some(existing => existing.name === planet.name);

    return !alreadyUsed;
  });

  let randomIndex = Math.floor(Math.random() * remaining.length);

  return remaining[randomIndex];
}

function withNewIds(planets) {
  return planets.map((planet, i) => ({ id: i + 1, ...planet }));
}
