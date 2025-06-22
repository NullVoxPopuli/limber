import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { modifier as eModifier } from 'ember-modifier';
import { getCompiler } from 'ember-repl';
import { effect } from 'reactiveweb/effect';

import { FlatButton } from 'limber-ui';

const FADE_MS = 1_000;

const fadeOut = eModifier((element, [msg]) => {
  if (!msg) return;

  element.classList.remove('fade-out');

  const timer = setTimeout(() => {
    element.classList.add('fade-out');
  }, FADE_MS);

  return () => {
    clearTimeout(timer);
  };
});

export class Status extends Component {
  @cached
  get compiler() {
    return getCompiler(this);
  }

  get last() {
    return this.compiler.lastInfo?.message;
  }

  get error() {
    return this.compiler.lastError?.message;
  }

  @tracked showError = true;

  hideError = () => (this.showError = false);
  newError = () => (this.showError = true);

  <template>
    {{#if this.last}}
      <footer {{fadeOut this.last}} data-test-status class="layout__status__info">
        {{this.last}}
      </footer>
    {{/if}}

    {{#if this.error}}
      {{effect (fn this.newError this.error)}}
      {{#if this.showError}}
        <footer
          data-test-error
          class="layout__status__error rounded border border-red-700 bg-red-100 drop-shadow-md"
        >
          <FlatButton
            {{on "click" this.hideError}}
            class="layout__status__error__close"
            aria-label="hide the help information"
          >
            <FaIcon @size="xs" @icon={{faXmark}} class="aspect-square" />
          </FlatButton>
          <pre class="whitespace-pre-wrap font-[monospace] text-base">{{this.error}}</pre>
        </footer>
      {{/if}}
    {{/if}}

    <style scoped>
      .layout__status__error__close {
        position: fixed;
        top: -1rem;
        left: -1rem;
      }
      .layout__status__info {
        position: absolute;
        bottom: 1rem;
        left: 1rem;
        opacity: 1;
        font-size: 0.8rem;
        transition: opacity 0.25s linear;

        &.fade-out {
          opacity: 0;
        }
      }
      .layout__status__error {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        z-index: 100;
        max-width: 60dvw;
        padding: 1rem;
        color: black;
      }
    </style>
  </template>
}
