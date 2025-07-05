import { tracked } from '@glimmer/tracking';

import type { ComponentLike } from '@glint/template';

export const RESOLVE = Symbol('CompileState::resolve');
export const REJECT = Symbol('CompileState::reject');

interface State {
  component: ComponentLike | undefined;
  error: Error | undefined;
  isReady: boolean;
  reason: string | undefined;
  promise: Promise<ComponentLike>;
  format: string;
}

interface Data {
  format: string;
  flavor?: string;
}

export class CompileState implements State {
  @tracked component: undefined | ComponentLike;
  @tracked error: undefined | Error;

  @tracked isReady = false;

  #data: Data;
  #resolve: undefined | ((value: ComponentLike) => void);
  #reject: undefined | ((reason?: any) => void);
  #promise = new Promise<ComponentLike>((resolve, reject) => {
    this.#resolve = resolve;
    this.#reject = reject;
  });

  constructor(data: Data) {
    this.#data = data;
  }

  get format() {
    return this.#data.format;
  }

  get reason() {
    return this.error?.message;
  }

  get isWaiting() {
    return !this.isReady && !this.error;
  }

  get promise() {
    return this.#promise;
  }

  /**
   * @private
   */
  [RESOLVE](component: ComponentLike) {
    this.isReady = true;
    this.component = component;
    this.#resolve?.(component);
  }
  /**
   * @private
   */
  [REJECT](error: Error) {
    this.error = error;
    this.#reject?.(error);
  }
}

export class MissingTextState extends CompileState {}

export class CachedCompileState extends CompileState {
  #resolvedPromise: Promise<ComponentLike>;
  constructor(data: Data, component: ComponentLike) {
    super(data);

    this.component = component;
    this.#resolvedPromise = Promise.resolve(component);
    this.isReady = true;
  }

  get promise() {
    return this.#resolvedPromise;
  }
}
