import { on } from '@ember/modifier';

const Button = <template>
  <button ...attributes aria-disabled={{@isDisabled}}>{{yield}}</button>
</template>;

function reportClick(event) {
  /* interact with some analytics service, amplitude, google, etc */
  console.log('tracking, not implemented nor relevant here');
}

/* implement modifier currying here */

const Demo = <template>
  {{yield (component Button isDisabled=@isDisabled)}}
</template>;

<template>
  <Demo as |AButton|>
    <AButton>
      a button
    </AButton>
  </Demo>
</template>
