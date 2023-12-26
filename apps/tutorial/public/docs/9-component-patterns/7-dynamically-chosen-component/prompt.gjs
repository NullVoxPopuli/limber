import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

// TODO:
// 1. define the components
// 2. fill out the MAP
// 3. update the `componentFor` function
const MAP = {};

const Fallback = <template>Choose an option</template>;

const componentFor = (key) => Fallback;

export default class Demo extends Component {
  @tracked selected;

  handleInput = (event) => {
    let formData = new FormData(event.currentTarget);
    let data = Object.fromEntries(formData.entries());
    this.selected = data.component;
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.handleInput(event);
  };

  <template>
    <form
      {{on 'input' this.handleInput}}
      {{on 'submit' this.handleSubmit}}
    >
      <fieldset>
        <legend>Choose a component</legend>
        <label>Three <input name="component" type="radio" value="three"></label>
        <label>Bee   <input name="component" type="radio" value="bee"></label>
        <label>Tree  <input name="component" type="radio" value="tree"></label>
      </fieldset>
    </form>

    <br>

    {{#let (componentFor this.selected) as |Selected|}}
      <Selected />
    {{/let}}
  </template>
}
