import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';

let count = tracked(0);

function handleInnerClick(clickEvent) {
  let customEvent = new Event('my-custom-event');
  clickEvent.target.dispatchEvent(customEvent);
}

let Inner = <template>
  <button ...attributes type="button" {{on 'click' handleInnerClick}}>
    Click me
  </button>
</template>;

function handleCustom(event) {
  count.value++;
}

<template>
  <Inner {{on 'my-custom-event' handleCustom}} />

  Clicked {{count.value}} times
</template>
