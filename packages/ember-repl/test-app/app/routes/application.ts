import Route from '@ember/routing/route';
import { service } from '@ember/service';

import compiler from 'ember-repl/compiler.js?url';
import sw from 'ember-repl/service-worker.js?url';

export default class Application extends Route {
  @service('ember-repl/compiler') compiler;

  beforeModel() {
    this.compiler.setup({
      serviceWorker: sw,
      compiler: compiler,
    });
  }
}
