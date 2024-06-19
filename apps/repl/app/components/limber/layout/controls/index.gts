import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { htmlSafe } from '@ember/template';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { inIframe } from 'ember-primitives/iframe';

import currentURL from 'limber/helpers/current-url';
import { service } from 'limber-ui';

import { Button, buttonClasses } from './button';
import { FormatMenu } from './format-menu';

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
        class="absolute top-0 right-0 z-[1]
          {{if @splitHorizontally 'flex flex-row-reverse' 'grid'}}
          {{if @isMinimized 'bg-ember-black h-full content-start'}}
          "
      >
        <Button
          title={{if @isMaximized "Back to split view" "Maximize Editor"}}
          {{on "click" (fn @send "MAXIMIZE")}}
        >
          {{#if @isMaximized}}
            <FaIcon @icon="columns" />
          {{else}}
            <FaIcon @icon="window-maximize" @prefix="far" />
          {{/if}}
        </Button>
        <Button
          title={{if @isMinimized "Back to split view" "Minimize Editor"}}
          {{on "click" (fn @send "MINIMIZE")}}
        >
          {{#if @isMinimized}}
            <FaIcon @icon="columns" />
          {{else}}
            <FaIcon @icon="window-minimize" @prefix="far" />
          {{/if}}
        </Button>
        <Button
          title="Rotate Editor/Output orientation"
          disabled={{or @isMaximized @isMinimized}}
          {{on "click" (fn @send "ROTATE")}}
        >
          <FaIcon @icon="rotate" />
        </Button>

        {{#if (inIframe)}}
          <a
            title="Edit in a new tab"
            href={{(currentURL)}}
            rel="noreferrer noopener"
            target="_blank"
            class="flex select-none py-2 px-3 text-white text-xs items-center hover:bg-[#9b2918] focus:ring-4 ring-inset focus:outline-none disabled:opacity-30"
          >
            <FaIcon @icon="external-link-alt" />
          </a>
        {{/if}}

      <FormatMenu class={{buttonClasses}} />
      </div>
    {{/let}}
  {{/if}}
</template>;
