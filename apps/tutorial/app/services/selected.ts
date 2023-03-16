import Service, { service } from '@ember/service';

import { use } from 'ember-resources';
import { keepLatest } from 'ember-resources/util/keep-latest';
import { RemoteData } from 'ember-resources/util/remote-data';

import { MarkdownToHTML } from './markdown';

import type DocsService from './docs';
import type { Tutorial } from './types';
import type RouterService from '@ember/routing/router-service';

export default class Selected extends Service {
  @service declare router: RouterService;
  @service declare docs: DocsService;

  /*********************************************************************
   * These load the files from /public and handle loading / error state.
   *
   * When the path changes for each of these, the previous request will
   * be cancelled if it was still pending.
   *******************************************************************/

  @use proseFile = RemoteData<string>(() => `/docs${this.path}/prose.md`);
  @use promptFile = RemoteData<string>(() => `/docs${this.path}/prompt.gjs`);
  @use answerFile = RemoteData<string>(() => `/docs${this.path}/answer.gjs`);
  @use proseCompiled = MarkdownToHTML(() => this.proseFile.value);

  /*********************************************************************
   * This is a pattern to help reduce flashes of content during
   * the intermediate states of the above request fetchers.
   * When a new request starts, we'll hold on the old value for as long as
   * we can, and only swap out the old data when the new data is done loading.
   *
   ********************************************************************/

  @use prose = keepLatest({
    value: () => this.proseCompiled.html,
    when: () => !this.proseCompiled.ready,
  });

  @use prompt = keepLatest({
    value: () => this.promptFile.value,
    when: () => this.promptFile.isLoading,
  });

  @use answer = keepLatest({
    value: () => this.answerFile.value,
    when: () => this.answerFile.isLoading,
  });

  /**
   * Once this whole thing is "true", we can start
   * rendering without extra flashes.
   */
  get isReady() {
    // Instead of inlining this, we want to access
    // these values without short-circuiting so that
    // the requests run in parallel.
    let prose = this.prose;
    let prompt = this.prompt;
    let answer = this.answer;

    return prose && prompt && answer;
  }

  get hasProse() {
    return this.proseFile.status !== 404 && Boolean(this.proseFile.value);
  }

  get hasPrompt() {
    return this.promptFile.status !== 404 && Boolean(this.promptFile.value);
  }

  get hasAnswer() {
    return this.answerFile.status !== 404 && Boolean(this.answerFile.value);
  }

  get next(): Tutorial | undefined {
    let found = false;
    let current = this.tutorial;

    for (let tutorial of this.docs.flatList) {
      if (found) {
        return tutorial;
      }

      if (current?.path && current.path === tutorial.path) {
        found = true;
      }
    }

    return;
  }

  get previous(): Tutorial | undefined {
    let previous = undefined;
    let current = this.tutorial;

    for (let tutorial of this.docs.flatList) {
      if (current?.path === tutorial.path) {
        return previous;
      }

      previous = tutorial;
    }

    return;
  }

  get path(): string | undefined {
    let [path] = this.router.currentURL.split('?');

    return path && path !== '/' ? path : this.#manifest?.first.path;
  }

  get tutorial(): Tutorial | undefined {
    if (!this.path) return;

    return this.#findByPath(this.path);
  }

  get #manifest() {
    return this.docs.docs.value;
  }

  #findByPath = (path: string) => {
    return this.docs.flatList.find((tutorial) => tutorial.path === path);
  };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    selected: Selected;
  }
}
