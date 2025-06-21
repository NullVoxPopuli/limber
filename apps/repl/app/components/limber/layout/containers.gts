import Building from './building';
import { Status } from './status.gts';

import type { TOC } from '@ember/component/template-only';

export const EditorContainer: TOC<{
  Element: HTMLElement;
  Args: {
    splitHorizontally: boolean;
  };
  Blocks: { default: [] };
}> = <template>
  <section
    data-test-editor-panel
    class="relative grid min-h-[38px] min-w-[38px] overflow-hidden
      {{if @splitHorizontally 'h-[40vh] w-full resize-y' 'min-h-full w-[40vw] resize-x'}}
      "
    ...attributes
  >
    {{yield}}
  </section>
</template>;

export const OutputContainer: TOC<{
  Blocks: { default: [] };
}> = <template>
  <section class="drop-shadow-inner relative grid flex-1 overflow-hidden">
    <div class="relative flex overflow-auto bg-white" data-test-output>
      {{yield}}
    </div>

    <Building />
    <Status />
  </section>
</template>;
