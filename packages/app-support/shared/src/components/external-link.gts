import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { ExternalLink as PrimitiveExternalLink } from 'ember-primitives';

import type { TOC } from '@ember/component/template-only';

const DefaultContent: TOC<{ Blocks: { default: [] } }> = <template>
  <span>{{yield}}</span>

  <FaIcon @icon={{faExternalLinkAlt}} />
</template>;

export const ExternalLink: TOC<{
  Element: HTMLAnchorElement;
  Args: {
    iconOnly?: true;
  };
  Blocks: {
    default: [];
    custom: [typeof DefaultContent];
  };
}> = <template>
  <PrimitiveExternalLink
    class="inline-flex items-baseline gap-2 rounded-sm hover:underline focus:outline-none focus:ring-4 focus-visible:outline-none"
    ...attributes
  >
    {{#if (has-block)}}
      <DefaultContent>
        {{yield}}
      </DefaultContent>
    {{else if (has-block "custom")}}
      {{yield DefaultContent to="custom"}}
    {{else if @iconOnly}}
      <FaIcon @icon={{faExternalLinkAlt}} />
    {{/if}}
  </PrimitiveExternalLink>
</template>;

export default ExternalLink;
