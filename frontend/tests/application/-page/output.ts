import { assert } from '@ember/debug';

import { PageObject, selector } from 'fractal-page-object';

export class OutputArea extends PageObject {
  get content() {
    assert('Output element does not exist', this.element);

    return this.element;
  }

  get firstButton() {
    assert('Output element does not exist', this.element);

    let button = this.element.querySelector('button');

    assert('Button was not rendered', button);

    return button;
  }

  get hasRenderedSnippets() {
    return this._demos.elements.length > 0;
  }

  get hasCodeSnippets() {
    return this._code.elements.length > 0;
  }

  _demos = selector('.glimdown-render');
  _code = selector('pre');
}
