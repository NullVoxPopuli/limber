let name = "world";
let shout = (text) => text.toUpperCase(); 
let reverse = (text) => text.split('').reverse().join('');

<template>
  <h1>Hello {{ (reverse (shout name) )}}</h1>
</template>
