import { LinkTo } from '@ember/routing';
import EmberRouter from '@ember/routing/router';

import { modifier } from 'ember-modifier';
import Application from 'ember-strict-application-resolver';

class Router extends EmberRouter {
  location = 'none';
  rootURL = '/';

  static {
    this.map(function () {
      this.route('foo');
      this.route('bar');
    });
  }
}

class App extends Application {
  modules = {
    './router': Router,
    './templates/application': <template>
      hi there
      <fieldset>
        {{outlet}}
      </fieldset>
      <br>
      <nav>
        <LinkTo @route="foo">foo</LinkTo>
        <LinkTo @route="bar">bar</LinkTo>
      </nav>
    </template>,
    './templates/foo': <template>foo</template>,
    './templates/bar': <template>bar</template>,
  };
}

const renderApp = modifier(rootElement => App.create({ rootElement }));

<template>
  <div {{renderApp}}></div>
</template>
