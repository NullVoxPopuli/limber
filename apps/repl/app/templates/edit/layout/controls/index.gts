import Helper from '@ember/component/helper';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service as eService } from '@ember/service';
import { htmlSafe } from '@ember/template';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import {
  faCircle,
  faCircleNotch,
  faColumns,
  faExternalLinkAlt,
  faRotate,
  faWindowMaximize,
  faWindowMinimize,
} from '@fortawesome/free-solid-svg-icons';
import { service } from 'ember-primitives/helpers/service';
import { inIframe } from 'ember-primitives/iframe';
import { castToBoolean,qp } from 'ember-primitives/qp';

import currentURL from 'limber/helpers/current-url';

import { Button } from './button.gts';

import type { TOC } from '@ember/component/template-only';

const or = (a: boolean, b: boolean) => a || b;

class updateQP extends Helper<{ Args: { Positional: [string, string]}, Return: string }> {
@eService router;
compute([qpName, nextValue]: [string, string]) {
const url = new URL(this.router.currentURL, location.origin);

  url.searchParams.set(qpName, nextValue);

  return (url.href);
}
}

function getShadowValue(qpValue) {
if (qpValue === undefined) return true;

return castToBoolean(qpValue);
}

export const Controls: TOC<{
  Args: {
    needsControls: boolean;
    splitHorizontally: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    send: (eventName: string) => void;
  };
}> = <template>
  {{#if @needsControls}}
    {{#let (service "editor") as |editor|}}
      <div
        data-is-minimized="{{@isMinimized}}"
        style={{htmlSafe (concat "right: " editor.scrollbarWidth "px;")}}
        class="absolute right-0 top-0 z-[1]
          {{if @splitHorizontally 'flex flex-row-reverse' 'grid'}}
          {{if @isMinimized 'bg-ember-black h-full content-start'}}
          "
      >
        <Button
          title={{if @isMaximized "Back to split view" "Maximize Editor"}}
          {{on "click" (fn @send "MAXIMIZE")}}
        >
          {{#if @isMaximized}}
            <FaIcon @icon={{faColumns}} />
          {{else}}
            <FaIcon @icon={{faWindowMaximize}} @prefix="far" />
          {{/if}}
        </Button>
        <Button
          title={{if @isMinimized "Back to split view" "Minimize Editor"}}
          {{on "click" (fn @send "MINIMIZE")}}
        >
          {{#if @isMinimized}}
            <FaIcon @icon={{faColumns}} />
          {{else}}
            <FaIcon @icon={{faWindowMinimize}} @prefix="far" />
          {{/if}}
        </Button>
        <Button
          title="Rotate Editor/Output orientation"
          disabled={{or @isMaximized @isMinimized}}
          {{on "click" (fn @send "ROTATE")}}
        >
          <FaIcon @icon={{faRotate}} />
        </Button>
        {{#let (getShadowValue (qp 'shadowdom')) as |shadow|}}
          <a
            title="Toggle Shadow DOM wrapper (currently: {{if shadow 'on' 'off'}})"
            href={{updateQP "shadowdom" (if shadow "off" "on")}}
            class="flex select-none items-center px-3 py-2 text-xs text-white ring-inset hover:bg-[#9b2918] focus:outline-none focus:ring-4 disabled:opacity-30"
          >
            {{#if shadow}}
              <FaIcon @icon={{faCircleNotch}} />
            {{else}}
              <FaIcon @icon={{faCircle}} />
            {{/if}}
          </a>
        {{/let}}

        {{#if (inIframe)}}
          <a
            title="Edit in a new tab"
            href={{(currentURL)}}
            rel="noreferrer noopener"
            target="_blank"
            class="flex select-none items-center px-3 py-2 text-xs text-white ring-inset hover:bg-[#9b2918] focus:outline-none focus:ring-4 disabled:opacity-30"
          >
            <FaIcon @icon={{faExternalLinkAlt}} />
          </a>
        {{/if}}
      </div>
    {{/let}}
  {{/if}}
</template>;
