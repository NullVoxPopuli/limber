import { assert } from '@ember/debug';
import { click } from '@ember/test-helpers';

import { PageObject } from 'fractal-page-object';

import { dt, s } from './-helpers';

export class DemoSelect extends PageObject {
  async select(text: string) {
    let toggleButton = this.element;

    assert('Demo selection went missing', toggleButton);

    await click(toggleButton);

    let option = [...(this.element?.parentElement?.querySelectorAll(dt('demo')) || [])].find(
      (option) => {
        assert(`option's element has been removed`, option && option instanceof HTMLButtonElement);

        return option.innerText === text;
      }
    );

    assert(`Could not find demo named "${text}"`, option);

    await click(option);
  }

  _options = s('demo');
}
