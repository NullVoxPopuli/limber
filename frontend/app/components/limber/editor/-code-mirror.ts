import { assert } from '@ember/debug';
import { isDestroyed, isDestroying, registerDestructor } from '@ember/destroyable';
import { service } from '@ember/service';

import Modifier from 'ember-modifier';
import { formatFrom } from 'limber/utils/messaging';

import type { EditorView } from '@codemirror/view';
import type RouterService from '@ember/routing/router-service';
import type EditorService from 'limber/services/editor';
import type { Format } from 'limber/utils/messaging';

type PositionalArgs = [string];
type Signature = {
  Element: HTMLDivElement;
  Args: {
    Positional: PositionalArgs;
  };
};

export default class CodeMirror extends Modifier<Signature> {
  @service declare editor: EditorService;
  @service declare router: RouterService;

  modify(element: Element, [value]: PositionalArgs) {
    this.setup(element, [value]);
  }

  isSetup = false;
  setup = async (element: Element, [value]: PositionalArgs) => {
    if (this.isSetup) {
      return;
    }

    await Promise.resolve();

    if (isDestroyed(this) || isDestroying(this)) return;

    assert(`Expected CODEMIRROR to exist`, CODEMIRROR);
    assert(`can only install codemirror editor an an HTMLElement`, element instanceof HTMLElement);

    element.innerHTML = '';

    let updateText = this.editor.updateText;
    let format = formatFrom(this.router.currentRoute.queryParams.format);
    let { view, setText } = CODEMIRROR(element, value, format, updateText);

    /**
     * This has to be defined on the service so that
     * the demo selector can also affect both the URL and the editor
     */
    this.editor._editorSwapText = (text, format) => {
      updateText(text); // update the service / URL
      setText(text, format); // update the editor
    };

    registerDestructor(this, () => view.destroy());
  };
}

let CODEMIRROR:
  | undefined
  | ((
      element: HTMLElement,
      value: Signature['Args']['Positional'][0],
      format: Format,
      updateText: (text: string) => void
    ) => { view: EditorView; setText: (text: string, format: Format) => void });

/**
 * This is called from the state machine which manages loading state
 */
export async function setupCodeMirror() {
  if (CODEMIRROR) return;

  // TypeScript doesn't have a way to type files in the public folder
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  CODEMIRROR = (await import(/* webpackIgnore: true */ '/codemirror/preconfigured.js')).default;
}
