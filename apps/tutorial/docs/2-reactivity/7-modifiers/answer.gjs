import { modifier } from 'ember-modifier';

const intensify = modifier((element) => {
  let animation = element.animate([
    { transform: "translateX(2px)" },
    { transform: "translateY(2px)" },
    { transform: "translateX(-2px)" },
  ], {
    duration: 100,
    iterations: Infinity,
  });

  return () => animation.cancel();
});

<template>
  <div {{intensify}}>
    content
  </div>
</template>
