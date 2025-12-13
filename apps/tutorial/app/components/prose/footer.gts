import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { service } from 'ember-primitives/helpers/service';

import { ExternalLink, Link } from '@nullvoxpopuli/limber-shared';

import { ShowMe } from './show-me';
import { UnShowMe } from './un-show-me';

const editPath = (path: string | undefined) =>
  `https://github.com/NullVoxPopuli/limber/tree/main/apps/tutorial/public/docs${path}`;
const not = (x: unknown) => !x;

export const FooterContent = <template>
  {{#let (service "docs") as |docs|}}

    <footer class="gap-4 p-2 text-sm drop-shadow-2xl grid bg-[#eee]">
      <div class="flex w-full items-center justify-between justify-self-end">
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
          href={{docs.selected.next}}
          @isDisabled={{not docs.selected.next}}
        >
          <span>Next</span>
          <FaIcon @icon={{faAngleRight}} />
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
