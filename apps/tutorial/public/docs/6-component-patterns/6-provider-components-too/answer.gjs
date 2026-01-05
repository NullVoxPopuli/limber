import { hash } from '@ember/helper';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class Counter extends Component {
  @tracked count = 0;

  increment = () => this.count++;
  decrement = () => this.count--;

  <template>
    {{yield (hash
      count=this.count
      increment=this.increment
      decrement=this.decrement
    )}}
  </template>
}

<template>
  <Counter as |counter|>
    <p>Count: {{counter.count}}</p>
    <button {{on 'click' counter.increment}}>+</button>
    <button {{on 'click' counter.decrement}}>-</button>
  </Counter>
</template>
