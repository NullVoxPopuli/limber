import { PortalTargets } from 'ember-primitives/components/portal-targets';
import { Seconds } from 'reactiveweb/interval';

import { clearError } from './clear-error.ts';
import Compiler from './compiler.gts';
import CopyMenu from './copy-menu.gts';

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

      <div class="output__compiler__duration">
        {{#if context.isWaiting}}
          building for ...
          {{Seconds}}s
        {{/if}}
      </div>

      <div class={{if (isGJS context.format) "glimdown-render"}}>
        <PortalTargets />

        {{#if context.component}}
          <div>
            {{clearError context.component}}
            <context.component />
          </div>
        {{/if}}

      </div>

    </div>
  </Compiler>

  <style>
    .output__compiler__duration {
      position: absolute;
      top: 0.75rem;
      right: 4rem;
      font-size: 0.8rem;
    }
  </style>
</template>;

export default Output;
