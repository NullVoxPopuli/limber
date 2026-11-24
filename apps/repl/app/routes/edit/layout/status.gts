import Component from '@glimmer/component';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCircleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { modifier as eModifier } from 'ember-modifier';

import { FlatButton } from '@nullvoxpopuli/limber-shared';

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

/**
 * A bar across the bottom of the output.
 *
 * An error stays until the next compile, or until it is dismissed.
 * Progress shows while there is no error, and fades.
 */
export class Status extends Component {
  @service declare status: StatusService;

  <template>
    <div class="layout__status">
      {{#let this.status.error as |error|}}
        {{#if error}}
          <section role="alert" data-test-error class="layout__status__error">
            <FaIcon @icon={{faCircleExclamation}} class="layout__status__icon" />

            <div class="layout__status__message">
              {{#if error.details}}
                <details>
                  <summary data-test-error-summary>{{error.summary}}</summary>
                  <pre data-test-error-details>{{error.details}}</pre>
                </details>
              {{else}}
                <p data-test-error-summary>{{error.summary}}</p>
              {{/if}}

              {{#if error.frame}}
                <pre data-test-error-frame>{{error.frame}}</pre>
              {{/if}}
            </div>

            <FlatButton
              {{on "click" this.status.dismiss}}
              aria-label="Dismiss the error"
              data-test-dismiss-error
            >
              <FaIcon @size="xs" @icon={{faXmark}} class="aspect-square" />
            </FlatButton>
          </section>
        {{else if this.status.last}}
          <p {{fadeOut this.status.last}} data-test-status class="layout__status__info">
            {{this.status.last}}
          </p>
        {{/if}}
      {{/let}}
    </div>

    <style>
      .layout__status {
        position: absolute;
        inset: auto 0 0 0;
        z-index: 100;
        pointer-events: none;

        > * {
          pointer-events: auto;
        }
      }

      .layout__status__info {
        pointer-events: none;
        margin: 0;
        padding: 0.25rem 1rem;
        font-size: 0.8rem;
        opacity: 1;
        transition: opacity 0.25s linear;
        text-shadow: 1px 1px 0px light-dark(white, black);

        &.fade-out {
          opacity: 0;
        }
      }

      .layout__status__error {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: start;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem 0.5rem 1rem;
        border-top: 2px solid light-dark(#b91c1c, #f87171);
        background: light-dark(#fee2e2, #3b0a0a);
        color: light-dark(#450a0a, #fee2e2);
        font-size: 0.9rem;
        line-height: 1.5rem;

        button {
          color: inherit;
          background: transparent;

          &:hover {
            background: light-dark(#fecaca, #7f1d1d);
          }
        }
      }

      .layout__status__icon {
        height: 1.5rem;
        color: light-dark(#b91c1c, #f87171);
      }

      .layout__status__message {
        min-width: 0;

        p,
        summary {
          margin: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        summary {
          cursor: pointer;
        }

        details[open] summary {
          white-space: normal;
        }

        pre {
          margin: 0.25rem 0 0;
          max-height: 40dvh;
          overflow: auto;
          font-family: "Source Code Pro", ui-monospace, monospace;
          font-size: 0.8rem;
          line-height: 1.25rem;
        }
      }
    </style>
  </template>
}
