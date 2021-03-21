import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class TabLink extends Component {
  @service router;

  get isActive() {
    let routeInfo = this.router.recognize(this.args.href);

    // TODO: RFC isActive to take a whole routeInfo
    //       It's too much work to recurse up the route tree building
    //       the arguments for this otherwise.
    return this.router.isActive(routeInfo.name);
  }

  @action
  handleClick(e) {
    e.preventDefault();

    let qps = new URLSearchParams(this.router.currentRoute.queryParams);

    this.router.transitionTo(this.args.href + `?${qps}`);
  }
}
