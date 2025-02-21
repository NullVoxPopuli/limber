import { assert } from '@ember/debug';

import { assertExists, PageObject, selector } from 'fractal-page-object';

export class OutputArea extends PageObject {
  get content() {
    assert('Output frame does not exist', this._innerDocument);

    return this._innerDocument.querySelector('[data-test-compiled-output]')?.textContent;
  }

  get firstButton() {
    assert('Output frame does not exist', this._innerDocument);

    const buttonsList = this._innerDocument.querySelectorAll('.glimdown-render > button');
    const buttons = [...buttonsList] as HTMLButtonElement[];
    const button = buttons.find((button) => !button.dataset['test-copy-menu']);

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

    const iframeElement = this._iframe.element as HTMLIFrameElement;
    const innerDoc = iframeElement.contentDocument;

    return innerDoc;
  }
}
