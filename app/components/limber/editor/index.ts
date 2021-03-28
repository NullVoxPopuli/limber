import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { modifier } from 'ember-could-get-used-to-this';

import monaco, { setupMonaco } from './monaco';

export default class Editor extends Component {
  @tracked isEditing = false;
  @tracked isLoading = false;

  monaco = monaco;

  waitForUser = modifier(() => {
    const activate = async () => {
      this.isLoading = true;

      await setupMonaco();

      this.isEditing = true;
      this.isLoading = false;
    };

    window.addEventListener('mousemove', activate);
    window.addEventListener('keydown', activate);

    return () => {
      window.removeEventListener('mousemove', activate);
      window.removeEventListener('keydown', activate);
    };
  });
}
