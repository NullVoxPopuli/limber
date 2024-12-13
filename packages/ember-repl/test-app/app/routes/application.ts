import Route from '@ember/routing/route';
import { service } from '@ember/service';

import compiler from 'ember-repl/workers/compiler?url';
import sw from 'ember-repl/sw?url';

export default class Application extends Route {
  @service('ember-repl/compiler') compiler;

  beforeModel() {
    this.compiler.setup({
      serviceWorker: sw,
      compiler: compiler,
    });
  }
}
