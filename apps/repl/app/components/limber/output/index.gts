import { PortalTargets } from 'ember-primitives';

import highlight from 'limber/modifiers/highlight-code-blocks';

import CopyMenu from '../copy-menu';
import Compiler from './compiler';

import type { MessagingAPI } from './frame-messaging';
import type { TOC } from '@ember/component/template-only';
import type { Format } from 'limber/utils/messaging';

interface Signature {
  Args: {
    messagingAPI: MessagingAPI;
  };
}

const isGJS = (format: Format | undefined) => format === 'gjs';

export const Output: TOC<Signature> = <template>
  <Compiler @messagingAPI={{@messagingAPI}} as |context|>
    <div class='p-4 prose max-w-full relative' data-test-compiled-output>
      {{!
            The copy menu exists here for two reasons:
             - we need to statically reference this component so that it doesn't get tree-shaken away
               (and therefor we'd see errors when dynamic content renders)
             - we also want to be able to copy the contents of the entire preview
          }}
      <CopyMenu />

      <div class={{if (isGJS context.format) 'glimdown-render'}}>
        <PortalTargets />

        {{#if context.component}}
          <div {{highlight context.component}}>
            {{!-- @glint-ignore --}}
            <context.component />
          </div>
        {{/if}}

      </div>

    </div>
  </Compiler>
</template>;

export default Output;
