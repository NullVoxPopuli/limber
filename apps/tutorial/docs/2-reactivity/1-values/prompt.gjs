import { cell } from 'ember-resources';

const theValue = cell('Hello World');

<template>
  {{theValue.current}}
</template>
