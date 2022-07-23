import { assert } from '@ember/debug';

import { assertExists, PageObject, selector } from 'fractal-page-object';

export class OutputArea extends PageObject {
  get content() {
    assert('Output frame does not exist', this._innerDocument);

    return this._innerDocument.querySelector('[data-test-output]');
  }

  get firstButton() {
    assert('Output frame does not exist', this._innerDocument);

    let buttonsList = this._innerDocument.querySelectorAll('.glimdown-render > button');
    let buttons = [...buttonsList] as HTMLButtonElement[];
    let button = buttons.find((button) => !button.dataset['test-copy-menu']);

    assert('Button was not rendered', button);

    return button;
  }

  get hasRenderedSnippets() {
    return (this._innerDocument?.querySelectorAll('.glimdown-render')?.length || 0) > 0;
  }

  get hasCodeSnippets() {
    return (this._innerDocument?.querySelectorAll('pre')?.length || 0) > 0;
  }

  private _iframe = selector('iframe');

  private get _innerDocument() {
    assertExists(`Could not find output frame`, this._iframe);

    let iframeElement = this._iframe.element as HTMLIFrameElement;
    let innerDoc = iframeElement.contentDocument;

    return innerDoc;
  }
}
