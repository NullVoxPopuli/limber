import EmberRouter from '@ember/routing/router';

import { properLinks } from 'ember-primitives/proper-links';
import { addRoutes } from "kolay";
import config from 'tutorial/config/environment';

@properLinks
export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  addRoutes(this);
});
