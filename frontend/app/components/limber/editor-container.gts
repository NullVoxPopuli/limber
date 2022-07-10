import { assert } from '@ember/debug';
import isEditing from 'limber/helpers/is-editing';
import { modifier } from 'ember-modifier';

import Editor from './editor';
import { EditorControls } from './editor/controls';

let getSize = () => localStorage.getItem('limber:editorWidth');
let setSize = (value: string) => localStorage.setItem('limber:editorWidth', value);

let frame: number | null;
const persist = (element: HTMLElement) => {
  return () => {
    let rect = element.getBoundingClientRect();

    setSize(`${rect.width}px`);
    frame = null;
  }
}

const debounced = (fn: (...args: unknown[]) => void) => {
  if (frame) cancelAnimationFrame(frame);
  frame = requestAnimationFrame(fn)
}

const persistedResize = modifier((element) => {
  assert(`Element is not resizable`, element instanceof HTMLElement)

  let observer = new ResizeObserver(() => debounced(persist(element)));
  let width = getSize();

  observer.observe(element);

  if (width) element.style.width = width;

  return () => observer.disconnect();
}, { eager: false });

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
        {{persistedResize}}
      >
        <Controls />

        <Editor />
      </section>
    </EditorControls>
  {{/if}}
</template>
