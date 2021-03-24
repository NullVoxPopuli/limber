import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class Editor extends Component {
  @tracked isEditing = false;

  @action
  handleClick() {
    this.isEditing = true;
  }
}
