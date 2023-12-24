import { cell } from 'ember-resources';

const greeting = cell('Hello World');

<template>
  {{greeting.current}}
</template>
