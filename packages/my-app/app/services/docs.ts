import Service, { service } from '@ember/service';
import { use } from 'ember-resources';
import { RemoteData } from 'ember-resources/util/remote-data';

import type RouterService from '@ember/routing/router-service';

interface Manifest {
  first: Tutorial;
  list: Tutorial[][];
  grouped: { [group: string]: Tutorial[] };
}
interface Tutorial {
  path: string;
  name: string;
  groupName: string;
  tutorialName: string;
}

export default class DocsService extends Service {
  @service declare router: RouterService;

  @use docs = RemoteData<Manifest>(() => `/docs/manifest.json`);

  get tutorials() {
    return this.docs.value?.list ?? [];
  }

  get grouped() {
    return this.docs.value?.grouped ?? {};
  }

  get selected(): Tutorial | undefined {
    return this.#fromURL() ?? this.docs.value?.first;
  }

  get showAnswer() {
    return (
      this.router.currentRoute?.queryParams?.['showAnswer'] === '1' ?? false
    );
  }

  #findByPath = (path: string) => {
    return this.tutorials
      .flat()
      .find((tutorial) => `/${tutorial.path}` === path);
  };

  #fromURL = () => {
    let [path] = this.router.currentURL.split('?');

    if (!path) return;

    return this.#findByPath(path);
  };
}
