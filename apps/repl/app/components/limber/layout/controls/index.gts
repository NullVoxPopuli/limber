import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { htmlSafe } from '@ember/template';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import {
  faColumns,
  faExternalLinkAlt,
  faRotate,
  faWindowMaximize,
  faWindowMinimize,
} from '@fortawesome/free-solid-svg-icons';
import { service } from 'ember-primitives/helpers/service';
import { inIframe } from 'ember-primitives/iframe';

import currentURL from 'limber/helpers/current-url';

import { Button } from './button';

import type { TOC } from '@ember/component/template-only';

const or = (a: boolean, b: boolean) => a || b;

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
