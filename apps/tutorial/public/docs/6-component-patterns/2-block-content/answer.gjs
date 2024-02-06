const MyComponent = <template>
  before
  <hr>
  {{yield}}
  <hr>
  after
</template>;

<template>
  <MyComponent>
    Example block content passed to
    <code>MyComponent</code>.
  </MyComponent>
</template>
