import { assert } from '@ember/debug';
import { currentURL } from '@ember/test-helpers';

import { PageObject } from 'fractal-page-object';

import { s } from './-helpers';

export class Nav extends PageObject {
  get activeTab() {
    const tab = this.tabs.find((tab) => tab.isActive);

    assert(`None of the tabs are active`, tab);

    return tab;
  }

  tabs = s(
    'nav-tab',
    class extends PageObject {
      get isActive() {
        assert(
          'Link cannot be active if it does not exist',
          this.element && this.element instanceof HTMLAnchorElement
        );

        const href = this.element.getAttribute('href');
        const currentPath = currentURL().split('?')[0];

        assert('Link did not have an href', href);

        return currentPath === href;
      }
    }
  );
}
