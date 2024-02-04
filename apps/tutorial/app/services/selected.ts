import Service, { service } from '@ember/service';

import { use } from 'ember-resources';
import { keepLatest } from 'reactiveweb/keep-latest';
import { link } from 'reactiveweb/link';
import { RemoteData } from 'reactiveweb/remote-data';

import { MarkdownToHTML } from './markdown';

import type DocsService from './docs';
import type { Tutorial } from './types';
import type RouterService from '@ember/routing/router-service';

/**
 * To help reduce load time between chapters, we'll load
 * the next and previous documents for each page
 */
async function preload(path?: string) {
  if (!path) return;

  await Promise.resolve();

  await Promise.all([
    fetch(`/docs/${path}/prose.md`),
    fetch(`/docs/${path}/prompt.gjs`),
    fetch(`/docs/${path}/answer.gjs`),
  ]);
}

class DocFile {
  @service declare router: RouterService;
  @service declare docs: DocsService;

  #fileName: string;

  constructor(fileName: string) {
    this.#fileName = fileName;
  }

  get url() {
    return `/docs${this.docs.currentPath}/${this.#fileName}`;
  }

  /*********************************************************************
   * This loads the file from /public and handles loading / error state.
   *
   * When the path changes, the previous request will
   * be cancelled if it was still pending.
   *******************************************************************/
  @use request = RemoteData<string>(() => this.url);

  /*********************************************************************
   * This is a pattern to help reduce flashes of content during
   * the intermediate states of the above request fetchers.
   * When a new request starts, we'll hold on the old value for as long as
   * we can, and only swap out the old data when the new data is done loading.
   *
   ********************************************************************/

  @use content = keepLatest({
    value: () => this.request.value,
    when: () => this.request.isLoading,
  });

  @use status = keepLatest({
    value: () => this.request.status,
    when: () => this.request.isLoading,
  });

  get exists() {
    let status = this.status;

    if (status && status > 400) return false;

    return Boolean(this.content);
  }
}

export default class Selected extends Service {
  @service declare router: RouterService;
  @service declare docs: DocsService;

  @link proseFile = new DocFile('prose.md');
  @link prompt = new DocFile('prompt.gjs');
  @link answer = new DocFile('answer.gjs');

  @use proseCompiled = MarkdownToHTML(() => this.proseFile.content);

  @use prose = keepLatest({
    value: () => this.proseCompiled.html,
    when: () => !this.proseCompiled.ready,
  });

  /**
   * Once this whole thing is "true", we can start
   * rendering without extra flashes.
   */
  get isReady() {
    // Instead of inlining these, we want to access
    // these values without short-circuiting so that
    // the requests run in parallel.
    let prose = this.prose;
    let prompt = this.prompt.content;
    let answer = this.answer.content;

    return prose && prompt && answer;
  }

  get hasProse() {
    return this.proseFile.exists;
  }

  get hasPrompt() {
    return this.prompt.exists;
  }

  get hasAnswer() {
    return this.answer.exists;
  }

  get next(): Tutorial | undefined {
    let found = false;
    let current = this.tutorial;

    for (let tutorial of this.docs.flatList) {
      if (found) {
        preload(tutorial.path);

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
        preload(previous?.path);

        return previous;
      }

      previous = tutorial;
    }

    return;
  }

  get tutorial(): Tutorial | undefined {
    if (!this.docs.currentPath) return;

    return this.#findByPath(this.docs.currentPath);
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
