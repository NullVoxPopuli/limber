import { cell } from 'ember-resources';
import { on } from '@ember/modifier';

let dark = '#222';
let light = '#eee';
let isOnDark = (color) => color === dark;

const Demo = <template>
  <style>
    .demo__inline-if {
      background: {{@background}};
      color: {{light}};
      padding: 2px 5px;
    }
  </style>

  <div class="demo__inline-if">
    content goes here
  </div>
</template>;

let isDark = cell(true);

<template>
  <Demo @background={{dark}} />

  <br>
  <button type="button" {{on 'click' isDark.toggle}}>Toggle Mode</button><br>
</template>;
