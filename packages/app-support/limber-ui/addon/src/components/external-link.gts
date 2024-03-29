import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { ExternalLink as PrimitiveExternalLink } from 'ember-primitives';

import type { TOC } from '@ember/component/template-only';

const DefaultContent: TOC<{ Blocks: { default: [] } }> = <template>
  <span>{{yield}}</span>

  <FaIcon @icon="external-link-alt" />
</template>;

export const ExternalLink: TOC<{
  Element: HTMLAnchorElement;
  Blocks: {
    default: [];
    custom: [typeof DefaultContent];
  };
}> = <template>
  <PrimitiveExternalLink
    class="inline-flex gap-2 items-baseline focus:ring-4 focus:outline-none focus-visible:outline-none rounded-sm hover:underline"
    ...attributes
  >
    {{#if (has-block)}}
      <DefaultContent>
        {{yield}}
      </DefaultContent>
    {{else if (has-block "custom")}}
      {{yield DefaultContent to="custom"}}
    {{/if}}
  </PrimitiveExternalLink>
</template>;

export default ExternalLink;
