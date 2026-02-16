import { cached, tracked } from '@glimmer/tracking';
import Service from '@ember/service';

import { getCompiler } from 'ember-repl';

export default class StatusService extends Service {
  @cached
  get compiler() {
    return getCompiler(this);
  }

  get last() {
    return this.compiler.lastInfo?.message;
  }

  get error() {
    return this.compiler.lastError?.message;
  }

  @tracked showError = true;

  hideError = () => void (this.showError = false);
  newError = () => void (this.showError = true);
}
