import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class Count {
  @tracked value = 0;

  decrement = () => this.value--;
  increment = () => this.value++;
  reset = () => this.value = 0;
}

let count = new Count();

let Incrementer = <template>
  <button type="button" {{on "click" count.increment}}>+</button>
</template>;

let Decrementer = <template>
  <button type="button" {{on "click" count.decrement}}>-</button>
</template>;

let Resetter = <template>
  <button type="button" {{on "click" count.reset}}>Reset</button>
</template>;


<template>
  <h1>The count is {{count.value}}</h1>

  <Incrementer />
  <Decrementer />
  <Resetter />
</template>

