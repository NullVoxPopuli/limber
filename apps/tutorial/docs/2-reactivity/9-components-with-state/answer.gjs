import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';


export default class Demo extends Component {
  @tracked myName = 'there';

  handleInput = (event) => this.myName = event.target.value;

  <template>
    <NameInput @onInput={{this.handleInput}} /><br>

    <Greeting @name={{this.myName}} />
  </template>
}

const NameInput = <template>
  <label>
    Name
    <input
      class="border border-gray-900"
      value="there"
      {{on "input" @onInput}}
    />
  </label>
</template>;


const Greeting = <template>
  Hello, {{@name}}!
</template>;
