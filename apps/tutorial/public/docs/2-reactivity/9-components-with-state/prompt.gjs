import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

const myName = cell('there');
const handleInput = (event) => myName.current = event.target.value;

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

  <Greeting @name={{myName.current}} />
</template>
