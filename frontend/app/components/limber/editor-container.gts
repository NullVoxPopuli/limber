import isEditing from 'limber/helpers/is-editing';
import Editor from './editor';
import { EditorControls } from './editor/controls';

<template>
  {{#if (isEditing)}}
    <EditorControls as |Controls container|>
      <section
        data-test-editor-panel
        class="
          grid resize-y lg:resize-x overflow-hidden
          relative
          transition-all
          w-full lg:w-[40vw]
          h-[40vh] lg:min-h-full"
        {{container}}
      >
        <Controls />

        <Editor />
      </section>
    </EditorControls>
  {{/if}}
</template>
