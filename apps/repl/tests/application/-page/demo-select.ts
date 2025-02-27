import { assert } from '@ember/debug';
import { click, settled } from '@ember/test-helpers';

import { PageObject } from 'fractal-page-object';

import { dt, s } from './-helpers';

export class DemoSelect extends PageObject {
  async select(text: string) {
    const toggleButton = this.element;

    assert('Demo selection went missing', toggleButton);

    await settled();
    await click(toggleButton);

    const options = [...(this.element?.parentElement?.querySelectorAll(dt('demo')) || [])];

    const option = options.find((option) => {
      assert(`option's element has been removed`, option && option instanceof HTMLButtonElement);

      return new RegExp(`\\b${text}\\b`).test(option.innerHTML);
    });

    assert(
      `Could not find demo named "${text}". Available: ${options
        .map((x) => x.innerHTML?.trim())
        .join(', ')}`,
      option
    );

    await click(option);
  }

  _options = s('demo');
}
