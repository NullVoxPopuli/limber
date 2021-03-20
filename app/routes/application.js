import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {

  async beforeModel() {
    document.querySelector('#initial-loader')?.remove();
  }
}
