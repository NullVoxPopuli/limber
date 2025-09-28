import './share.css';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { array, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faShareFromSquare, faXmark } from '@fortawesome/free-solid-svg-icons';
// @ts-expect-error womp types
import { focusTrap } from 'ember-focus-trap';
import { Modal } from 'ember-primitives/components/dialog';
import { KeyCombo } from 'ember-primitives/components/keys';
import { cell } from 'ember-resources';

import { SaveBanner, SHOW_TIME } from '#components/save.gts';

import { shortenUrl } from 'limber/utils/editor-text';
import { FlatButton } from '@nullvoxpopuli/limber-shared';

import type { TOC } from '@ember/component/template-only';
import type RouterService from '@ember/routing/router-service';

const isShowing = cell(false);

const not = (x: unknown) => !x;

export const Share = <template>
  <Modal as |m|>
    <button data-share-button type="button" {{on "click" m.open}} {{m.focusOnClose}}>
      <span class="hidden sm:inline-flex">Share</span>
      <FaIcon @icon={{faShareFromSquare}} />
    </button>

    <m.Dialog class="preem" inert={{not m.isOpen}} {{focusTrap isActive=m.isOpen}}>
      <SaveBanner @isShowing={{isShowing.current}} />

      {{#if m.isOpen}}
        <div class="modal-facade">
          <ShareModal @onCancel={{m.close}} />
        </div>
      {{/if}}
    </m.Dialog>
  </Modal>
</template>;

class ShareModal extends Component<{ onCancel: () => void }> {
  <template>
    <header><h2>Share</h2>
      <FlatButton {{on "click" @onCancel}} aria-label="close this share modal">
        <FaIcon @size="xs" @icon={{faXmark}} class="aspect-square" />
      </FlatButton>
    </header>
    <form {{on "submit" this.handleSubmit}}>
      <main>
        {{#if this.error}}
          <div class="error">{{this.error}}</div>
        {{/if}}
        <div class="inline-mini-form">
          <ReadonlyField
            @label="shortened URL"
            @value={{this.shortUrl}}
            @copyable={{Boolean this.shortUrl}}
            placeholder="Click 'Create'"
          />

          {{#unless this.shortUrl}}
            <button type="submit">Create</button>
          {{/unless}}
        </div>
        <Tip>
          <KeyCombo @keys={{array "Ctrl" "S"}} @mac={{array "Command" "S"}} />
          will copy a shortened URL to your clipboard.</Tip>
      </main>

      <footer>
        <div class="right">
          <div class="buttons">
            <button type="button" class="cancel" {{on "click" @onCancel}}>Close</button>
            {{#unless this.shortUrl}}
              <button type="submit">Create Link</button>
            {{/unless}}
          </div>
        </div>
      </footer>
    </form>
  </template>

  @service declare router: RouterService;

  @tracked shortUrl: string | undefined;
  @tracked error: string | undefined;

  toClipboard = async () => {
    let url = location.origin + this.router.currentURL;

    try {
      url = await shortenUrl(url);
      this.shortUrl = url;
    } catch (e) {
      console.error(`Could not shorten the URL`);
      console.error(e);
      throw e;
    }

    isShowing.set(true);
    await navigator.clipboard.writeText(url);

    await new Promise((resolve) => setTimeout(resolve, SHOW_TIME));
    isShowing.set(false);
  };

  handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    this.error = undefined;

    const href = window.location.href;

    if (!href.includes('glimdown.com')) {
      if (href.includes('localhost')) {
        this.error = "You're on localhost, silly, here is a fake error with fake URL";
        this.shortUrl = 'https://share.glimdown.com/something';
      } else {
        this.error = 'This is only supported on glimdown.com';
      }

      return;
    }

    try {
      await this.toClipboard();
    } catch (e) {
      if (typeof e === 'object' && e !== null) {
        if ('message' in e && typeof e.message === 'string') {
          this.error = e.message;

          return;
        }
      }

      console.error(e);
      this.error = `An unknown error occurred. Details in the console. If you have time, a bug report would be appreciated <3`;
    }
  };
}

async function writeToClipboard(text: string) {
  isShowing.set(true);
  await navigator.clipboard.writeText(text);
  await new Promise((resolve) => setTimeout(resolve, SHOW_TIME));
  isShowing.set(false);
}

// "with copy" / @copyable={{true}}?
const ReadonlyField: TOC<{
  Element: HTMLInputElement;
  Args: {
    label: string;
    value: string | undefined;
    copyable?: boolean | undefined;
  };
}> = <template>
  <span class="field">
    <label for="share-copy">{{@label}}</label>
    <span class="field-input">
      <input value={{@value}} name="share-copy" readonly ...attributes />
      {{#if @copyable}}
        <button type="button" {{on "click" (fn writeToClipboard @value)}}>Copy</button>
      {{/if}}
    </span>
  </span>
</template>;

const Tip: TOC<{
  Blocks: {
    default: [];
  };
}> = <template>
  <div class="preem__tip"><span class="preem__tip__bulb">💡</span><p
      class="preem__tip__text"
    >{{yield}}</p></div>
</template>;
