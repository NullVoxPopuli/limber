import { cached, tracked } from '@glimmer/tracking';
import Service from '@ember/service';

import { getCompiler } from 'ember-repl';

import { summarize } from '#app/utils/error-summary.ts';

import type { ErrorMessage } from 'repl-sdk';

export default class StatusService extends Service {
  @cached
  get compiler() {
    return getCompiler(this);
  }

  get last() {
    return this.compiler.lastInfo?.message;
  }

  /**
   * Each compile reports new message objects,
   * so a dismissed error stays hidden only until the next one.
   */
  @tracked dismissed: ErrorMessage | undefined;

  @cached
  get error() {
    const error = this.compiler.lastError;

    if (!error || error === this.dismissed) return;

    return summarize(error.message, error.error);
  }

  dismiss = () => {
    this.dismissed = this.compiler.lastError;
  };
}
