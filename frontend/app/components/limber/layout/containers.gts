import { htmlSafe } from '@ember/template';
import { notInIframe } from 'limber/helpers/in-iframe';
import constrainVertically from 'limber/modifiers/constrain-vertically';

import Building from './building';
import Error from './error';

import type { TemplateOnlyComponent as TOC } from '@ember/component/template-only';

export const EditorContainer: TOC<{
  Element: HTMLElement;
  Args: {
    splitHorizontally: boolean;
  },
  Blocks: { default: [] }
}> = <template>
  <section
    data-test-editor-panel
    class="
      grid overflow-hidden relative transition-all
      min-w-[38px] min-h-[38px]
      {{if @splitHorizontally
        'w-full h-[40vh] resize-y'
        'w-[40vw] min-h-full resize-x'
      }}
    "
    ...attributes
  >
    {{yield}}
  </section>
</template>;

export const OutputContainer: TOC<{
  Blocks: { default: [] }
}> = <template>
  <section class="flex-1 shadow-inner grid overflow-hidden relative">
    <div
      class="overflow-auto relative bg-white flex"
      data-test-output
    >
      {{yield}}
    </div>

    <Building />
    <Error />
  </section>
</template>;

