import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { service } from '@ember/service';

import { inIframe } from 'ember-primitives/iframe';
import { cell } from 'ember-resources';

import { Button } from '@nullvoxpopuli/limber-shared';

import type { Format } from '../languages.gts';
import type EditorService from '#services/editor.ts';

const userAllowed = cell(false);
const allowCodeExecution = () => (userAllowed.current = true);

const emberjs = 'emberjs.com';
const ALLOWED = Object.freeze([]);
const MARKUP_FORMATS = new Set([
  'js',
  'gjs',
  'vue',
  'jsx',
  'jsx|react',
  'svelte',
  'md',
  'gmd',
  'hbs',
  'hbs|ember',
]);
const SCRIPT_FORMATS = new Set(['js', 'gjs', 'vue', 'jsx', 'jsx|react', 'svelte']);

function couldHaveMarkup(format: Format) {
  return MARKUP_FORMATS.has(format);
}

function couldHaveScript(format: Format) {
  return SCRIPT_FORMATS.has(format);
}

function checkDanger(format: Format, text?: string | null): string[] | readonly string[] {
  const reasons: string[] = [];
  const isAllowed = userAllowed.current;

  if (isAllowed || !text) {
    return ALLOWED;
  }

  if (origin.includes(emberjs)) {
    if (inIframe()) {
      /**
       * parent matches iframe.
       * ember.js guards what it ships in iframes very closely.
       */
      if (window.parent.location.origin.includes(emberjs)) {
        return ALLOWED;
      }
    }

    reasons.push(
      `On emberjs domains, when visiting the REPL directly, it's recommend to review the code before running it.`
    );
  }

  if (couldHaveMarkup(format)) {
    const matches = text.matchAll(/iframe/g);

    if (matches) {
      for (const match of matches) {
        if (match.includes('iframe')) {
          if (text.includes('<iframe')) {
            reasons.push(`Detected iframe usage, ensure the specified 'src' is safe.`);
          }
        }
      }
    }
  }

  if (couldHaveScript(format)) {
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
  }

  return reasons;
}

export class VerifyDanger extends Component<{ Blocks: { default: [] } }> {
  @service declare editor: EditorService;

  @cached
  get dangerReasons() {
    return checkDanger(this.editor.format, this.editor.text);
  }

  get isAllowed() {
    return this.dangerReasons.length === 0;
  }

  <template>
    {{#if this.isAllowed}}
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
            if you don't want to run the code, you may either edit the code until you're happy with
            it, or close this tab.
          </p>
          <p>
            Reasons why we're asking:
            <ul>
              {{#each this.dangerReasons as |reason|}}
                <li>{{reason}}</li>
              {{/each}}
            </ul>
          </p>
          <p>
            For your safety, this decision will not persist across page-rolads.
            <br />
            (and so you can "navigate back" and edit the code if you need to)
          </p>
        </div>
      </div>
    {{/if}}
  </template>
}
