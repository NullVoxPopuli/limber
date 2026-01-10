const AcceptButton = <template>
  <button>Accept</button>
</template>;

const DeclineButton = <template>
  <button>Decline {{@text}}</button>
</template>;

const ButtonGroup = <template>
  {{yield (Object
    Accept=AcceptButton
    Decline=DeclineButton
  )}}
</template>;

<template>
  <ButtonGroup as |b|>
    <b.Accept />
    <b.Decline @text="to accept" />
  </ButtonGroup>
</template>
