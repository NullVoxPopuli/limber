import { modifier } from 'ember-modifier';
import { TrackedObject } from 'tracked-built-ins';

let characters = ['🥳', '🎉', '✨'];

let confetti = new Array(100).fill()
  .map((_, i) => {
    return new TrackedObject({
      character: characters[i % characters.length],
      x: Math.random() * 100,
      y: -20 - Math.random() * 100,
      r: 0.1 + Math.random() * 1
    });
  })
  .sort((a, b) => a.r - b.r);

const animate = modifier((element) => {
  let frame;

  function loop() {
    frame = requestAnimationFrame(loop);

    confetti.forEach((emoji) => {
      emoji.y += 0.7 * emoji.r;
      if (emoji.y > 120) emoji.y = -20;
    });
  }

  frame = requestAnimationFrame(loop);

  return () => cancelAnimationFrame(frame);
});

<template>
  <div class="container" {{animate}}>
    {{#each confetti as |c|}}
      <span style="left: {{c.x}}%; top: {{c.y}}%; transform: scale({{c.r}})">{{c.character}}</span>
    {{/each}}
  </div>

  <style>
    .container {
      position: fixed;
      top: 0; bottom: 0; left: 0; right: 0;
    }

    .container span {
      position: absolute;
      font-size: 5vw;
      user-select: none;
    }
  </style>
</template>

// Original: https://svelte.dev/tutorial/congratulations
