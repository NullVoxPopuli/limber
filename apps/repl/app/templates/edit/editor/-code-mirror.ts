import { assert } from '@ember/debug';
import { isDestroyed, isDestroying, registerDestructor } from '@ember/destroyable';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';

import Modifier from 'ember-modifier';
import { syntaxHighlighting } from '@codemirror/language';

import type { EditorView } from '@codemirror/view';
import type RouterService from '@ember/routing/router-service';
import type { FormatQP } from '#app/languages.gts';
import type EditorService from 'limber/services/editor';
import { getCompiler } from 'ember-repl';
import { HorizonSyntaxTheme, HorizonTheme } from './theme.ts';

type Signature = {
  Element: HTMLDivElement;
};

/**
 * We ignore updates, because we don't want to tell the editor to update itself.
 * It has its own state-management, and if we were to update it from here,
 * it would extra / unneeded work / basically a no-op
 *
 * This modifier is a class-based modifier _solely_ for getting easier access to services
 */

let CODEMIRROR:
  | undefined
  | ((
      element: HTMLElement,
      value: string | null,
      format: FormatQP,
      handleUpdate: (text: string) => void
    ) => Promise<{ view: EditorView; setText: (text: string, format: FormatQP) => Promise<void> }>);

export default class CodeMirror extends Modifier<Signature> {
  @service declare editor: EditorService;
  @service declare router: RouterService;

  modify(element: Element) {
    waitForPromise(this.setup(element));
  }

  // For deduping incidental changes to the *format* Signal
  // (Since auto-tracking is _by-reference_ for now)
  //
  // We only want to re-create the editor when the format changes value
  previousFormat: FormatQP | undefined;

  setup = async (element: Element) => {
    const { format } = this.editor;

    if (format === this.previousFormat) {
      return;
    }

    this.previousFormat = format;

    /**
     * As long as tracked data is accessed after this await,
     * we will never update due to tracked data changes (we manually update)
     */
    await Promise.resolve();

    if (isDestroyed(this) || isDestroying(this)) return;

    assert(`can only install codemirror editor an an HTMLElement`, element instanceof HTMLElement);

    const { text: value } = this.editor;
    const updateText = this.editor.updateText;
    const compiler = getCompiler(this);

    element.innerHTML = '';
    element.setAttribute('data-format', format);


    const { view, setText } = await compiler.createEditor(element, {
      text: value,
      format,
      handleUpdate: updateText,
      extensions: [
        HorizonTheme,
        syntaxHighlighting(HorizonSyntaxTheme),
      ]
    });

    if (isDestroyed(this) || isDestroying(this)) return;

    /**
     * This has to be defined on the service so that
     * the demo selector can also affect both the URL and the editor
     */
    this.editor.setCodemirrorState = (text, formatQP) => {
      element.setAttribute('data-formatQP', formatQP);

      waitForPromise(setText(text, format)); // update the editor
    };

    const scrollable = document.querySelector('.cm-scroller');

    if (scrollable instanceof HTMLElement) {
      this.editor.scrollbarWidth = scrollable.offsetWidth - scrollable.clientWidth;
    }

    registerDestructor(this, () => view.destroy());
  };
}


