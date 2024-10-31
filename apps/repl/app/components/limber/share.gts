import { array } from '@ember/helper';
import { on } from '@ember/modifier';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { focusTrap } from 'ember-focus-trap';
import { Modal } from 'ember-primitives/components/dialog';

import { FlatButton } from './help';

import type { TOC } from '@ember/component/template-only';

// copyAsText = (event: Event) => {
//   let code = getSnippetElement(event);
//
//   navigator.clipboard.writeText(code.innerText);
// };

export const Share = <template>
  {{! prettier-ignore }}
  <style>
    button[data-share-button] {
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
      transition-property: all;
      --tw-ring-color: var(--ember-brand);
      --tw-text-opacity: 1;
      color: rgb(255 255 255 / var(--tw-text-opacity));
      padding: 0.25rem 0.5rem;
      /**
      * TODO: can this be nested automatically?
      */
      border-radius: 0.25rem;
      cursor: pointer;

      &:focus-visible, &:focus {
        outline: 2px solid transparent;
        outsilen-offset: 2px;
      }
      &:focus {
        --tw-ring-offset-shadow:
            var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
          --tw-ring-shadow:
            var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color);
          box-shadow:
            var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
      }
    }


    .preem__tip {
      --tw-bg-opacity: 1;
      margin: 0.5rem;
      padding: 1rem;
      background: white;
      background: rgb(240 249 255 / var(--tw-bg-opacity));
      color: rgb(50, 60, 100);
      position: relative;

      .preem__tip__bulb {
        position: absolute;
        left: 1rem;
        top: 1rem;
        text-shadow: 1px 2px 1px rgba(0,0,0,0.2);
        font-size: 1.5rem;
      }
      .preem__tip__text {
        padding-left: 2rem;
      }
    }
    dialog.preem {
      border-radius: 0.25rem;
      animation: var(--animation-slide-in-up), var(--animation-fade-in);
      animation-timing-function: var(--ease-out-5);
      animation-duration: 0.2s;
    }
    dialog.preem::backdrop {
      backdrop-filter: blur(1px);
    }
    dialog.preem header {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
    }
    dialog.preem h2 {
      margin: 0 !important;
    }

    dialog.preem main {
      padding: 2rem;
      max-width: 500px;
    }

    dialog.preem footer {
      padding: 1rem;

      .right {
        display: grid;
        justify-content: end;
      }

      .buttons {
        display: flex;
        gap: 1rem;
      }

      button {
        color: white;
        border-radius: 0.25rem;
        padding: 0.25rem 0.5rem;
        background: var(--code-bg);
        border: 1px solid var(--horizon-border);
      }

      button:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
        --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width)
          var(--tw-ring-offset-color);
        --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width))
          var(--tw-ring-color);
        box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
      }

      button:focus-visible {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      button:hover {
        opacity: 0.9;
      }
    }
  </style>
  <Modal as |m|>
    <button data-share-button {{on "click" m.open}}>
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
        <ReadonlyField @label="shortened URL" @value="pending..." />
        <Tip>
          <KeyCombo @keys={{array "Ctrl" "S"}} @mac={{array "Command" "S"}} />
          will copy a shortened URL to your clipboard.</Tip>
      </main>
      <footer>
        <div class="right">
          <div class="buttons">
            <button>Close</button>
            <button>Create Link</button>
          </div>
        </div>
      </footer>
    </m.Dialog>
  </Modal>
</template>;

// "with copy" / @copyale={{true}}?
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
