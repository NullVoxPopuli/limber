import isEditing from 'limber/helpers/is-editing';

import { Orientation } from './orientation'
import { EditorControls } from './controls';
import { EditorContainer, OutputContainer } from './containers';

<template>
  <Orientation as |splitHorizontally rotate|>
    <div
      {{! row = left to right, col = top to bottom }}
      class="
        {{if splitHorizontally "flex-col" "flex-row"}}
        flex overflow-hidden"
    >
      {{#if (isEditing)}}
        <EditorControls
          @splitHorizontally={{splitHorizontally}}
          @rotate={{rotate}}
          as |Controls container|
        >
          <EditorContainer
            @splitHorizontally={{splitHorizontally}}
            {{container}}
          >
            <Controls />

            {{yield to="editor"}}

          </EditorContainer>
        </EditorControls>
      {{/if}}


      <OutputContainer>

        {{yield to="output"}}

      </OutputContainer>
    </div>
  </Orientation>
</template>
