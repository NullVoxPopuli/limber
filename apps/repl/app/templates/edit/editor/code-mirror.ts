import { assert } from '@ember/debug';
import { isDestroyed, isDestroying, registerDestructor } from '@ember/destroyable';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';

import { syntaxHighlighting } from '@codemirror/language';
import Modifier from 'ember-modifier';
import { getCompiler } from 'ember-repl';

import { HorizonSyntaxTheme, HorizonTheme } from './theme.ts';

import type RouterService from '@ember/routing/router-service';
import type EditorService from 'limber/services/editor';

type Signature = {
  Element: HTMLDivElement;
  Args: {
    Positional: never[];
    Named: {
      /**
       * Default: false
       */
      defer?: boolean;
      onStateChange?: (state: {
        isLoading: boolean;
        isDone: boolean;
        error: undefined | null | string;
      }) => void;
    };
  };
};

/**
 * We ignore updates, because we don't want to tell the editor to update itself.
 * It has its own state-management, and if we were to update it from here,
 * it would extra / unneeded work / basically a no-op
 *
 * This modifier is a class-based modifier _solely_ for getting easier access to services
 */
class CodeMirror extends Modifier<Signature> {
  @service declare editor: EditorService;
  @service declare router: RouterService;

  #load?: () => void;

  modify(element: Element, _: never[], named: Signature['Args']['Named']) {
    /**
     * Supporting legacy URLs: &forceEditor
     *
     * New Scheme:
     * - editorLoad=force
     * - editorLoad=onclick
     * - editorLoad=never
     */
    const { editorLoad, forceEditor } = this.router.currentRoute?.queryParams ?? {};

    if (editorLoad === 'never') {
      return;
    }

    this.#checkFormat();

    if (this.#load) return;

    if (!named.defer) {
      waitForPromise(this.setup(element));

      return;
    }

    const cleanup = () => {
      if (this.#load) {
        window.removeEventListener('mousemove', this.#load);
        window.removeEventListener('keydown', this.#load);
        window.removeEventListener('touchstart', this.#load);
        window.removeEventListener('click', this.#load);
      }
    };

    this.#load = () => {
      cleanup();
      named.onStateChange?.({ isLoading: true, isDone: false, error: null });

      waitForPromise(
        this.setup(element)
          .then(() => {
            named.onStateChange?.({ isLoading: false, isDone: true, error: null });
          })
          .catch((e) => {
            named.onStateChange?.({ isLoading: false, isDone: false, error: e });
          })
      );
    };

    if (forceEditor || editorLoad === 'force') {
      waitForPromise(
        (async () => {
          await Promise.resolve();

          this.#load?.();
        })()
      );

      return;
    }

    registerDestructor(this, () => {
      cleanup();
    });

    if (editorLoad === 'onclick') {
      window.addEventListener('click', this.#load, { passive: true });

      return;
    }

    window.addEventListener('mousemove', this.#load, { passive: true });
    window.addEventListener('keydown', this.#load, { passive: true });
    window.addEventListener('touchstart', this.#load, { passive: true });
  }

  #previousFormat?: string;
  #setFormat?: (format: string) => void;
  #checkFormat = async () => {
    const format = this.editor.format;

    if (format === this.#previousFormat) {
      return;
    }

    return this.#setFormat?.(format);
  };

  /**
   * We don't allow this to run more than once.
   * The editor has to be managed imperatively / with callbacks
   * from this point forward
   */
  #isSetup = false;

  setup = async (element: Element) => {
    if (this.#isSetup) return;
    this.#isSetup = true;

    /**
     * As long as tracked data is accessed after this await,
     * we will never update due to tracked data changes (we manually update)
     */
    await Promise.resolve();

    if (isDestroyed(this) || isDestroying(this)) return;

    assert(`can only install codemirror editor an an HTMLElement`, element instanceof HTMLElement);

    const { text: value } = this.editor;
    let formatFromURL: string = this.editor.format;

    this.#previousFormat = formatFromURL;

    const updateText = this.editor.updateText;
    const compiler = getCompiler(this);

    if (formatFromURL === 'hbs') {
      formatFromURL = 'hbs|ember';
    }

    element.innerHTML = '';
    element.setAttribute('data-format', formatFromURL);

    const { view, setText, setFormat } = await compiler.createEditor(element, {
      text: value,
      format: formatFromURL,
      handleUpdate: updateText,
      extensions: [HorizonTheme, syntaxHighlighting(HorizonSyntaxTheme)],
    });

    if (isDestroyed(this) || isDestroying(this)) return;

    this.#setFormat = (format: string) => {
      element.setAttribute('data-format', format);
      this.#previousFormat = format;
      waitForPromise(setFormat(format));
    };

    /**
     * This has to be defined on the service so that
     * the demo selector can also affect both the URL and the editor
     */
    this.editor.setCodemirrorState = (text, formatQP) => {
      element.setAttribute('data-format', formatQP);

      this.#previousFormat = formatQP;
      waitForPromise(setText(text, formatQP));
    };

    const scrollable = document.querySelector('.cm-scroller');

    if (scrollable instanceof HTMLElement) {
      this.editor.scrollbarWidth = scrollable.offsetWidth - scrollable.clientWidth;
    }

    registerDestructor(this, () => view.destroy());
  };
}

export const codemirror = CodeMirror;
