import { assert } from '@ember/debug';
import { triggerEvent } from '@ember/test-helpers';

import { PageObject, selector } from 'fractal-page-object';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { diffText } from 'onp/dist';

import { s } from './-helpers';

const removeInvisibleCharacters = (text: string) => text.replaceAll(/[\n\r\s]+/g, '');

export class Editor extends PageObject {
  async load() {
    await triggerEvent(document.body, 'mousemove');

    assert(`Editor failed to load`, !this._placeholder.element);
  }

  get activeEditor() {
    let { _editor, _placeholder } = this;

    let active = [_editor, _placeholder].find((editor) => editor.element);

    assert(`Something went wrong, there is no active editor`, active);

    return active;
  }
  /**
   * Because editors do goofy things, we need to normalize
   * both the text in the editor and the passed text
   */
  hasText(text: string) {
    let editorText = this.activeEditor._text;

    let _editor = removeInvisibleCharacters(editorText);
    let _text = removeInvisibleCharacters(text);

    // need to chop down the source text to the amount that we can see in the editor.
    // editors will optimize to the viewport so that they don't degrade perf
    let diff = diffText(_editor, _text.slice(0, _editor.length));
    let similarity = 1 - diff.distance / _text.length;

    return similarity > 0.75;
  }

  _editor = selector(
    '.cm-content',
    class extends PageObject {
      get _text() {
        assert('Editor not present', this.element);

        return this.element.textContent || '';
      }
    }
  );

  _placeholder = s(
    'placeholder',
    class extends PageObject {
      get _text() {
        assert('Placeholder not present', this.element);

        return this.element.textContent || '';
      }
    }
  );
}
