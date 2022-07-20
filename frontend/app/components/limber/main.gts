import { hash } from '@ember/helper';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import _ContainerQuery from 'ember-container-query/components/container-query';
import aspectRatio from 'ember-container-query/helpers/cq-aspect-ratio';

import constrainVertically from 'limber/modifiers/constrain-vertically';
import { notInIframe } from 'limber/helpers/in-iframe';
import isEditing from 'limber/helpers/is-editing';

import Building from './building';
import Error from './error';
import Editor from './editor';
import Navigation from './navigation';
import { EditorControls } from './editor/controls';

import type { ComponentLike, HelperLike } from "@glint/template";
import type { TemplateOnlyComponent as TOC } from '@ember/component/template-only';

const ContainerQuery: ComponentLike = _ContainerQuery as unknown as ComponentLike<{
    Element: HTMLDivElement;
    Args: {
      features: any;
    },
    Blocks: {
      default: [{ features: any }]
    }
  }>;

const EditorContainer: TOC<{
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

const OutputContainer = <template>
  <section
    class="flex-1 shadow-inner grid overflow-hidden relative"
    style="grid-template-rows: min-content 1fr;"
  >
    {{#if (notInIframe)}}
      <Navigation />
    {{/if}}

    <div
      class="overflow-auto relative bg-white"
      {{constrainVertically}}
      data-test-output
    >
      {{outlet}}
    </div>

    <Building />
    <Error />
  </section>
</template>;

class Orientation extends Component {
  @tracked forcedAlternate?: boolean;

  rotate = () => this.forcedAlternate = !this.forcedAlternate;
  reset = (_splitHorizontallyQuery: boolean) => {
    (async () => {
      // Delay so that we don't infinite loop, since we consume
      // forcedAlternate during render
      await Promise.resolve();
      this.forcedAlternate = undefined;
    })();
  }

  intent = (splitHorizontallyQuery: boolean) => {
    return this.forcedAlternate || splitHorizontallyQuery;
  }

  <template>
    <ContainerQuery
      @features={{hash horizontalSplit=(aspectRatio max=1.2)}}
      {{! grid forces all the contents to take up all available vertical space }}
      class="grid"
      {{constrainVertically}}
      as |query|
    >

      {{#let query.features.horizontalSplit as |splitHorizontally|}}

        {{ (this.reset splitHorizontally) }}

        {{yield (this.intent splitHorizontally) this.rotate}}

      {{/let}}

    </ContainerQuery>
  </template>
}

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
          <EditorContainer @splitHorizontally={{splitHorizontally}} {{container}}>
            <Controls />
            <Editor />
          </EditorContainer>
        </EditorControls>
      {{/if}}

      <OutputContainer />
    </div>
  </Orientation>
</template>
