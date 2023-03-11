/* eslint-disable @typescript-eslint/no-explicit-any */
import { tracked } from '@glimmer/tracking';

import { Resource } from 'ember-resources';

/**
 * Utility for manipulating any kind of state.
 *
 * ```hbs
 *  {{#let (State) as |state|}}
 *    the value: {{state.value}}
 *
 *    <button {{on 'click' state.toggle}}>toggle it</button>
 *
 *    <button {{on 'click' (fn state.update false)}}>reset it</button>
 *  {{/let}}
 * ```
 */
export default class State extends Resource {
  @tracked value: any;

  update = (nextValue: any) => (this.value = nextValue);
  toggle = () => (this.value = !this.value);
  increment = () => (this.value = (this.value || 0) + 1);
  handleInput = (event: any) => (this.value = event.target?.value);
}
