let name = "world";
let shout = (text) => text.toUpperCase(); 

<template>
  <h1>Hello {{ (shout name) }}</h1>
</template>
