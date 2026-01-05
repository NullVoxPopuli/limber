import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class Counter extends Component {
  @tracked count = 0;

  increment = () => this.count++;
  decrement = () => this.count--;

  <template>
    {{yield this.count this.increment this.decrement}}
  </template>
}

<template>
  <Counter as |count increment decrement|>
    <p>Count: {{count}}</p>
    <button {{on 'click' increment}}>+</button>
    <button {{on 'click' decrement}}>-</button>
  </Counter>
</template>
