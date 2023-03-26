import { htmlSafe } from '@ember/template';

const untrusted = 'some <em>untrusted</em> <h1>string</h1>';

<template>
  {{untrusted}}
</template>
