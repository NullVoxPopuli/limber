import { tracked } from '@glimmer/tracking';

/**
 * TODO: move to ember-resources
 */
export default class Cell<T = unknown> {
  @tracked current;

  constructor(initial: T) {
    this.current = initial;
  }

  update = (nextValue: T) => (this.current = nextValue);
}

export function cell<T = unknown>(initial?: T) {
  return new Cell(initial);
}
