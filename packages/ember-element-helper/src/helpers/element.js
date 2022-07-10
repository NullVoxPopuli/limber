// eslint-disable-next-line ember/no-classic-components
import EmberComponent from '@ember/component';
import Helper from '@ember/component/helper';
import { assert, runInDebug } from '@ember/debug';

import { ensureSafeComponent } from '@embroider/util';

function UNINITIALIZED() {}

export default class ElementHelper extends Helper {
  constructor() {
    super(...arguments);
    this.tagName = UNINITIALIZED;
    this.componentClass = null;
  }

  compute(params, hash) {
    assert('The `element` helper takes a single positional argument', params.length === 1);
    assert(
      'The `element` helper does not take any named arguments',
      Object.keys(hash).length === 0
    );

    let tagName = params[0];

    if (tagName !== this.tagName) {
      this.tagName = tagName;

      if (typeof tagName === 'string') {
        this.componentClass = ensureSafeComponent(
          class DynamicElement extends EmberComponent {
            tagName = tagName; // eslint-disable-line ember/require-tagless-components
          },
          this
        );
      } else {
        this.componentClass = null;

        runInDebug(() => {
          let message = 'The argument passed to the `element` helper must be a string';

          try {
            message += ` (you passed \`${tagName}\`)`;
          } catch (e) {
            // ignore
          }

          assert(message, tagName === undefined || tagName === null);
        });
      }
    }

    return this.componentClass;
  }
}
