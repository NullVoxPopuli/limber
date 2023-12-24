import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

let count = cell(0);

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
  count.current++;
}

<template>
  <Inner {{on 'my-custom-event' handleCustom}} />

  Clicked {{count.current}} times
</template>
