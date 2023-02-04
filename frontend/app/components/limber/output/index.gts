import highlight from 'limber/modifiers/highlight-code-blocks';

import CopyMenu from '../copy-menu';
import Compiler from './compiler';

import type { TOC } from '@ember/component/template-only';
import type { MessagingAPI } from './frame-messaging';

interface Signature {
  Args: {
    messagingAPI: MessagingAPI
  }
}

export const Output: TOC<Signature> =
<template><Compiler @messagingAPI={{@messagingAPI}} as |context|>
  <div class='p-4 prose max-w-full relative' data-test-compiled-output>
    {{!
        The copy menu exists here for two reasons:
         - we need to statically reference this component so that it doesn't get tree-shaken away
           (and therefor we'd see errors when dynamic content renders)
         - we also want to be able to copy the contents of the entire preview
      }}
    <CopyMenu />

    {{#if context.component}}
      {{#let (component context.component) as |Preview|}}
        {{! @glint-ignore }}
        <div {{highlight context.component}}>
          <Preview />
        </div>
      {{/let}}
    {{/if}}

  </div>
</Compiler></template>;

export default Output;
