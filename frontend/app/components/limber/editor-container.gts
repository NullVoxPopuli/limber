import isEditing from 'limber/helpers/is-editing';

import Editor from './editor';
import { EditorControls } from './editor/controls';

import type { TemplateOnlyComponent as TOC } from '@ember/component/template-only';

export const EditorContainer: TOC<{
  Args: {
    splitHorizontally: boolean;
  }
}> =
<template>
  {{#if (isEditing)}}
    <EditorControls as |Controls container|>
      <section
        data-test-editor-panel
        class="
          grid overflow-hidden relative transition-all
          {{if @splitHorizontally
            "w-full h-[40vh] resize-y"
            "w-[40vw] min-h-full resize-x"
          }}
        "
        {{container}}
      >
        <Controls />

        <Editor />
      </section>
    </EditorControls>
  {{/if}}
</template>

export default EditorContainer;
