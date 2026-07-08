import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';

const myName = tracked('there');
const handleInput = (event) => myName.value = event.target.value;

const NameInput = <template>
  <label>
    Name
    <input
      class="border border-gray-900"
      value="there"
      {{on "input" handleInput}}
    />
  </label>
</template>;


const Greeting = <template>
  Hello, {{@name}}!
</template>;

<template>
  <NameInput /><br>

  <Greeting @name={{myName.value}} />
</template>
