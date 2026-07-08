import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

let dark = '#222';
let light = '#eee';
let isOnDark = (color) => color === dark;

const Demo = <template>
  <style>
    .demo__inline-if {
      background: {{@background}};
      color: {{if (isOnDark @background) light dark}};
      padding: 2px 5px;
    }
  </style>

  <div class="demo__inline-if">
    content goes here
  </div>
</template>;

let isDark = tracked(true);

function toggleMode() {
  isDark.value = !isDark.value;
}

<template>
  <Demo @background={{if isDark.value dark light}} />

  <br>
  <button type="button" {{on 'click' toggleMode}}>Toggle Mode</button><br>
</template>;
