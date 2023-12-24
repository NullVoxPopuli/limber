import { on } from '@ember/modifier';

const Button = <template>
  <button ...attributes aria-disabled={{@isDisabled}} type="button">{{yield}}</button>
</template>;

function reportClick(event) {
  /* interact with some analytics service, amplitude, google, etc */
  console.log('tracking, not implemented or relevant here');
}

const CurriedButton = <template>
  <Button
    ...attributes
    {{on 'click' reportClick}}
    @isDisabled={{@isDisabled}}
  >
    {{yield}}
  </Button>
</template>;

const Demo = <template>
  {{yield (component CurriedButton isDisabled=@isDisabled)}}
</template>;

<template>
  <Demo as |AButton|>
    <AButton>
      a button
    </AButton>
  </Demo>
</template>
