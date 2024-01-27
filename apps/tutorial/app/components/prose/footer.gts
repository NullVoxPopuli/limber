import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

import { ExternalLink, Link, service } from 'limber-ui';

import { ShowMe } from './show-me';
import { UnShowMe } from './un-show-me';

const editPath = (path: string | undefined) =>
  `https://github.com/NullVoxPopuli/limber/tree/main/apps/tutorial/public/docs${path}`;
const not = (x: unknown) => !x;

export const FooterContent = <template>
  {{#let (service "docs") as |docs|}}

    <footer class="grid p-2 gap-4 text-sm bg-[#eee] drop-shadow-2xl">
      <div class="flex justify-between items-center justify-self-end w-full">
        {{#if docs.selected.hasAnswer}}
          {{#if docs.showAnswer}}
            <UnShowMe />
          {{else}}
            <ShowMe />
          {{/if}}
        {{else}}
          <span></span>
        {{/if}}

        <Link
          data-test-next
          href={{docs.selected.next.path}}
          @isDisabled={{not docs.selected.next.path}}
        >
          <span>Next</span>
          <FaIcon @icon="angle-right" />
        </Link>
      </div>

      {{! If we don't have prose, it's likely the whole folder doesn't exist either }}
      {{#if docs.selected.hasProse}}
        <ExternalLink href={{editPath docs.currentPath}}>
          Edit this page
        </ExternalLink>
      {{/if}}

    </footer>
  {{/let}}
</template>;
