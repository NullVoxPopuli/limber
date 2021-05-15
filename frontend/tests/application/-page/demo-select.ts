import { assert } from '@ember/debug';
import { click } from '@ember/test-helpers';

import { PageObject } from 'fractal-page-object';

import { s } from './-helpers';

export class DemoSelect extends PageObject {
  async select(text: string) {
    let toggleButton = this._toggle.element;

    assert('Demo selection went missing', toggleButton);

    await click(toggleButton);

    let option = this._options.find((option) => {
      assert(
        `option's element has been removed`,
        option.element && option.element instanceof HTMLButtonElement
      );

      return option.element.innerText === text;
    });

    assert(`Could not find demo named "${text}"`, option?.element);

    await click(option.element);
  }

  _toggle = s('toggle');
  _options = s('demo');
}
