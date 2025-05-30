import { tracked } from '@glimmer/tracking';

import type { ComponentLike } from '@glint/template';

export const RESOLVE = Symbol('CompileState::resolve');
export const REJECT = Symbol('CompileState::reject');

export class CompileState implements PromiseLike<CompileState> {
  @tracked component: undefined | ComponentLike;
  @tracked error: undefined | Error;

  @tracked isReady = false;

  #resolve: undefined | ((value: ComponentLike) => void);
  #reject: undefined | ((reason?: any) => void);
  #promise = new Promise<ComponentLike>((resolve, reject) => {
    this.#resolve = resolve;
    this.#reject = reject;
  });

  get reason() {
    return this.error?.message;
  }

  get promise() {
    return this.#promise;
  }

  then<TResult1 = CompileState, TResult2 = never>(
    onfulfilled?: ((value: CompileState) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.#promise
      .then(() => onfulfilled?.(this))
      .catch((e) => onrejected?.(e)) as PromiseLike<TResult1 | TResult2>;
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
  constructor(component: ComponentLike) {
    super();

    this.component = component;
    this.#resolvedPromise = Promise.resolve(component);
    this.isReady = true;
  }

  get promise() {
    return this.#resolvedPromise;
  }
}
