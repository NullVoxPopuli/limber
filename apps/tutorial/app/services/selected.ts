import Service, { service } from '@ember/service';

import { use } from 'ember-resources';
import { Compiled as MarkdownToHTML } from 'kolay';
import { keepLatest } from 'reactiveweb/keep-latest';
import { link } from 'reactiveweb/link';
import { RemoteData } from 'reactiveweb/remote-data';
import { nextPage } from 'tutorial/utils';

import type DocsService from './docs';
import type RouterService from '@ember/routing/router-service';
import type { Page } from 'kolay';

class DocFile {
  @service declare router: RouterService;
  @service declare docs: DocsService;

  #fileName: string;

  constructor(fileName: string) {
    this.#fileName = fileName;
  }

  get url() {
    return `/docs/${this.docs.currentPath}/${this.#fileName}`;
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
    const status = this.status;

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
    value: () => this.proseCompiled.component,
    when: () => !this.proseCompiled.isReady,
  });

  /**
   * Once this whole thing is "true", we can start
   * rendering without extra flashes.
   */
  get isReady() {
    // Instead of inlining these, we want to access
    // these values without short-circuiting so that
    // the requests run in parallel.
    const prose = this.prose;
    const prompt = this.prompt.content;
    const answer = this.answer.content;

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

  get next(): string | undefined {
    return nextPage(this.docs.tutorials, this.tutorial);
  }

  get previous(): string | undefined {
    return nextPage(this.docs.tutorials.toReversed(), this.tutorial);
  }

  get tutorial(): Page | undefined {
    if (!this.docs.currentPath) return;

    return this.#findByPath(this.docs.currentPath);
  }

  #findByPath = (path: string) => {
    const prosePath = `${path}/prose.md`;

    return this.docs.tutorials.find((tutorial) => tutorial.path === prosePath);
  };
}
