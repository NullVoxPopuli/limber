import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { modifier } from 'ember-could-get-used-to-this';

export default class Editor extends Component {
  @tracked isEditing = false;

  waitForUser = modifier(() => {
    const activate = () => (this.isEditing = true);

    window.addEventListener('mousemove', activate);
    window.addEventListener('keydown', activate);

    return () => {
      window.removeEventListener('mousemove', activate);
      window.removeEventListener('keydown', activate);
    };
  });
}
