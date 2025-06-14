import { PortalTargets } from 'ember-primitives/components/portal-targets';

import { Seconds } from 'reactiveweb/interval';

import highlight from 'limber/modifiers/highlight-code-blocks';

import CopyMenu from '../copy-menu';
import Compiler from './compiler';

const isGJS = (format: string | undefined) => format === 'gjs';

export const Output = <template>
  <Compiler as |context|>
    <div class="prose relative max-w-full p-4" data-test-compiled-output>
      {{!
            The copy menu exists here for two reasons:
             - we need to statically reference this component so that it doesn't get tree-shaken away
               (and therefor we'd see errors when dynamic content renders)
             - we also want to be able to copy the contents of the entire preview
          }}
      <CopyMenu />

      <div class={{if (isGJS context.format) "glimdown-render"}}>
        <PortalTargets />

        {{#if context.isWaiting}}
          Building for ...
          {{Seconds}}s
        {{/if}}

        {{#if context.component}}
          <div {{highlight context.component}}>
            <context.component />
          </div>
        {{/if}}

      </div>

    </div>
  </Compiler>
</template>;

export default Output;
