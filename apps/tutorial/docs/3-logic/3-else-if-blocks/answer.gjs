let x = 7;

const moreThan10 = () => x > 10;
const lessThan5 = () => x < 5;

<template>
  {{#if (moreThan10 x)}}
    <p>{{x}} is greater than 10</p>
  {{else if (lessThan5)}}
    <p>{{x}} is less than 5</p>
  {{else}}
    <p>{{x}} is between 5 and 10</p>
  {{/if}}
</template>
