import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Demo extends Component {
  <template>
    {{this.value}}
  </template>

  @tracked value = 0;
}
