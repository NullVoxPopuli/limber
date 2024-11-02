import './share.css';

import Component from '@glimmer/component';
import { array } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { focusTrap } from 'ember-focus-trap';
import { Modal } from 'ember-primitives/components/dialog';

import { shortenUrl } from 'limber/utils/editor-text';

import { FlatButton } from './help';

import type { TOC } from '@ember/component/template-only';
import type RouterService from '@ember/routing/router-service';

export class Share extends Component {
  <template>
    <Modal as |m|>
      <button data-share-button type="button" {{on "click" m.open}}>
        Share
        <FaIcon @icon="share-from-square" @prefix="fas" />
      </button>
      <m.Dialog class="preem" {{focusTrap isActive=m.isOpen}}>
        <header><h2>Share</h2>

          <FlatButton {{on "click" m.close}} aria-label="close this share modal">
            <FaIcon @size="xs" @icon="xmark" class="aspect-square" />
          </FlatButton>
        </header>
        <main>
          <form {{on "submit" this.handleSubmit}}>
            <ReadonlyField @label="shortened URL" @value="Click 'Create'" />

            <button type="button">Create</button>
          </form>
          <Tip>
            <KeyCombo @keys={{array "Ctrl" "S"}} @mac={{array "Command" "S"}} />
            will copy a shortened URL to your clipboard.</Tip>
        </main>
        <footer>
          <div class="right">
            <div class="buttons">
              <button type="button" class="cancel">Close</button>
              <button type="button">Create Link</button>
            </div>
          </div>
        </footer>
      </m.Dialog>
    </Modal>
  </template>

  @service declare router: RouterService;

  toClipboard = async () => {
    let url = location.origin + this.router.currentURL;

    if (window.location.href.includes('glimdown.com')) {
      try {
        url = await shortenUrl(url);
      } catch (e) {
        console.error(`Could not shorten the URL`);
        console.error(e);
        throw e;
      }
    }

    await navigator.clipboard.writeText(url);
  };

  handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    try {
      await this.toClipboard();
    } catch {
      // TODO: Toast message
    }
  };
}

// "with copy" / @copyable={{true}}?
const ReadonlyField: TOC<{
  Args: {
    label: string;
    value: string;
  };
}> = <template>
  <label>
    <span>{{@label}}</span>
    <input value={{@value}} readonly />
  </label>
</template>;

const isLast = (collection: unknown[], index: number) => index === collection.length - 1;
const isNotLast = (collection: unknown[], index: number) => !isLast(collection, index);
const isMac = navigator.userAgent.indexOf('Mac OS') >= 0;
const getKeys = (keys: string[], mac: string[]) => (isMac ? mac ?? keys : keys);

const KeyCombo: TOC<{
  Args: {
    keys: string[];
    mac: string[];
  };
}> = <template>
  <span class="preem__key-combination">
    {{#let (getKeys @keys @mac) as |keys|}}
      {{#each keys as |key i|}}
        <Key>{{key}}</Key>
        {{#if (isNotLast @keys i)}}
          <span class="preem__key-combination__separator">+</span>
        {{/if}}
      {{/each}}
    {{/let}}
  </span>
</template>;

const Key: TOC<{
  Blocks: { default?: [] };
}> = <template>
  <span class="preem-key">{{yield}}</span>
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
