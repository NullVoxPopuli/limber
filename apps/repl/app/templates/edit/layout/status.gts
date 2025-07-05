import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { modifier as eModifier } from 'ember-modifier';
import { effect } from 'reactiveweb/effect';

import { FlatButton } from 'limber-ui';

import type StatusService from '#app/services/status.ts';

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
  @service declare status: StatusService;

  get last() {
    return this.status.last;
  }

  get error() {
    return this.status.error;
  }

  <template>
    {{#if this.last}}
      <footer {{fadeOut this.last}} data-test-status class="layout__status__info">
        {{this.last}}
      </footer>
    {{/if}}

    {{#if this.error}}
      {{effect (fn this.status.newError this.error)}}
      {{#if this.status.showError}}
        <footer
          data-test-error
          class="layout__status__error rounded border border-red-700 bg-red-100 drop-shadow-md"
        >
          <FlatButton
            {{on "click" this.status.hideError}}
            class="layout__status__error__close"
            aria-label="hide the help information"
          >
            <FaIcon @size="xs" @icon={{faXmark}} class="aspect-square" />
          </FlatButton>
          <pre class="layout__status__error__details">{{this.error}}</pre>
        </footer>
      {{/if}}
    {{/if}}

    <style>
      .layout__status__error__close {
        position: fixed;
        top: -1rem;
        left: -1rem;
      }
      .layout__status__info {
        pointer-events: none;
        position: absolute;
        bottom: 1rem;
        left: 1rem;
        opacity: 1;
        font-size: 0.8rem;
        transition: opacity 0.25s linear;
        text-shadow: 1px 1px 0px rgba(255,255,255,1);

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

      .layout__status__error__details {
        max-height: 80dvh;
        overflow: auto;
        font-size: 1rem;
        font-family: monospace;
        line-height: 1.5rem;
        white-space: pre-wrap;
      }
    </style>
  </template>
}
