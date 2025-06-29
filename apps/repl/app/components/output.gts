import { PortalTargets } from 'ember-primitives/components/portal-targets';
import { Shadowed } from 'ember-primitives/components/shadowed';
import { Seconds } from 'reactiveweb/interval';

import { clearError } from './clear-error.ts';
import Compiler from './compiler.gts';
import CopyMenu from './copy-menu.gts';
import resetsCSS from './output-reset.css?url';

import type { TOC } from '@ember/component/template-only';
import qp from '#app/helpers/qp.ts';

const isGJS = (format: string | undefined) => format === 'gjs';

function wantsShadow(arg: boolean | undefined, qp: string) {
  if (arg === undefined) return true;

  return arg;
}

export const Output: TOC<{
  Args: {
    shadow?: boolean;
  };
}> = <template>
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
          {{clearError context.component}}

          {{#if (wantsShadow @shadow (qp "shadowdom"))}}
            <Shadowed>
              <link rel="stylesheet" href={{resetsCSS}} />
              <context.component />
            </Shadowed>
          {{else}}
            <context.component />
          {{/if}}
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
