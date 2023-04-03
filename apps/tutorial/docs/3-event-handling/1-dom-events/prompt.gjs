import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class Coordinates {
  @tracked x = '?';
  @tracked y = '?';
}

let m = new Coordinates();

function handleMouseMove(mouseEvent) {
  m.x = mouseEvent.clientX;
  m.y = mouseEvent.clientY;
}

<template>
  <div>
    The mouse position is {{m.x}} x {{m.y}}
  </div>
</template>
