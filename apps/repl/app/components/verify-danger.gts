import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import { inIframe } from 'ember-primitives/iframe';
import { cell } from 'ember-resources';

import { Button } from '@nullvoxpopuli/limber-shared';

import type EditorService from '#services/editor.ts';

const userAllowed = cell(false);
const allowCodeExecution = () => (userAllowed.current = true);

const emberjs = 'emberjs.com';

function checkDanger(text?: string | null): { isAllowed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const isAllowed = userAllowed.current;

  if (isAllowed || !text) {
    return { isAllowed, reasons };
  }

  if (origin.includes(emberjs)) {
    if (inIframe()) {
      /**
       * parent matches iframe.
       * ember.js guards what it ships in iframes very closely.
       */
      if (window.parent.location.origin.includes(emberjs)) {
        return { isAllowed: true, reasons };
      }
    }

    reasons.push(
      `On emberjs domains, when visiting the REPL directly, it's recommend to review the code before running it.`
    );
  }

  const matches = text.matchAll(/window|globalThis|iframe|open|location/g);

  if (matches) {
    for (const match of matches) {
      if (match.length === 0) continue;

      if (match.includes('open')) {
        reasons.push(
          `Detected a call to 'open', and don't know if this is window.open or something safer`
        );
      }

      if (match.includes('window')) {
        if (text.includes('window.open(')) {
          reasons.push(`Detected a call to window.open()`);
        }

        if (text.includes('window.parent.open(')) {
          reasons.push(`Detected a call to window.parent.open()`);
        }
      }

      if (match.includes('location')) {
        if (text.match(/location\.href ?=/)) {
          reasons.push(`Detected assignment to location.href`);
        }
      }

      if (match.includes('globalThis')) {
        if (text.includes('globalThis.open(')) {
          reasons.push(`Detected a call to globalThis.open()`);
        }
      }

      if (match.includes('iframe')) {
        if (text.includes('iframe')) {
          reasons.push('Detected iframe usage.');
        }
      }
    }
  }

  return { isAllowed, reasons };
}

export class VerifyDanger extends Component<{ Blocks: { default: [] } }> {
  @service declare editor: EditorService;

  <template>
    {{#let (checkDanger this.editor.text) as |x|}}
      {{#if x.isAllowed}}
        {{yield}}
      {{else}}

        <div class="prose p-8 relative grid max-w-full" style="justify-items: center">
          <p>Would you like to run the code?</p>
          <Button {{on "click" allowCodeExecution}}>
            <span style="color: black;">Yes, trust and run this code</span>
          </Button>
          <div>
            <hr />

            <p>
              if you don't want to run the code, you may either edit the code until you're happy
              with it, or close this tab.
            </p>
            <p>
              Reasons why we're asking:
              <ul>
                {{#each x.reasons as |reason|}}
                  <li>{{reason}}</li>
                {{/each}}
              </ul>
            </p>
          </div>
        </div>
      {{/if}}
    {{/let}}
  </template>
}
