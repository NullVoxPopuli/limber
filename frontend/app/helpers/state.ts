import { tracked } from '@glimmer/tracking';

import { Resource } from 'ember-resources/core';

export default class State extends Resource {
  @tracked value: unknown;

  update = (nextValue: unknown) => (this.value = nextValue);
  toggle = () => (this.value = !this.value);
}
