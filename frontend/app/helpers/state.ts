import { tracked } from '@glimmer/tracking';

import { Resource } from 'ember-resources';

export default class State extends Resource {
  @tracked value: unknown;

  update = (nextValue: unknown) => (this.value = nextValue);
}
