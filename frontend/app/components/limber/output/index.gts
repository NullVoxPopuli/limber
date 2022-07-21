import service from 'limber/helpers/service';
import highlight from 'limber/modifiers/highlight-code-blocks';
import CopyMenu from './copy-menu';

import Compiler from './compiler';

<template>
  <Compiler as |context|>
    <div class='p-4 prose max-w-full relative'>
      {{!--
        The copy menu exists here for two reasons:
         - we need to statically reference this component so that it doesn't get tree-shaken away
           (and therefor we'd see errors when dynamic content renders)
         - we also want to be able to copy the contents of the entire preview
      --}}
      <CopyMenu />

      {{#if context.component}}
        {{#let (component context.component) as |Preview|}}
          <div {{highlight context.component}}>
            <Preview />
          </div>
        {{/let}}
      {{/if}}

    </div>
  </Compiler>
</template>
