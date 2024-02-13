import { hash } from '@ember/helper';

const AcceptButton = <template>
  <button>Accept</button>
</template>;

const DeclineButton = <template>
  <button>Decline {{@text}}</button>
</template>;

const CustomButton = <template>
  <button>
    <span>
      {{yield to="default"}}
    </span>
    {{#if (has-block "right")}}
      <span>
        {{yield to="right"}}
      </span>
    {{/if}}
  </button>
</template>


const ButtonGroup = <template>
  {{yield (hash
    Accept=AcceptButton
    Decline=DeclineButton
    Custom=CustomButton
  )}}
</template>;

<template>
  <ButtonGroup as |b|>
    <b.Accept />
    <b.Decline @text="to accept" />
  </ButtonGroup>
</template>
