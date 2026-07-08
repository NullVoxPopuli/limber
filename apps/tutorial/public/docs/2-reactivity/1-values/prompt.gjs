import { tracked } from '@glimmer/tracking';

const greeting = tracked('Hello World');

<template>
  {{greeting.value}}
</template>
