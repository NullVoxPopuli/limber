const AcceptButton = <template>
  <button>Accept</button>
</template>;

const DeclineButton = <template>
  <button>Decline {{@text}}</button>
</template>;

const CustomButton = <template>
  <button>
    {{yield}}
  </button>
</template>


const ButtonGroup = <template>
  {{yield (Object
    Accept=AcceptButton
    Decline=DeclineButton
    Custom=CustomButton
  )}}
</template>;

<template>
  <ButtonGroup as |b|>
    <b.Accept />
    <b.Decline @text="to accept" />
    <c.Custom>
      text here
    </c.Custom>
  </ButtonGroup>
</template>
