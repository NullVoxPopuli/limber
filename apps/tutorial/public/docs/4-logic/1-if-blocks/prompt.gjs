import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class User {
  @tracked loggedIn = false;
}

const user = new User();
const notLoggedIn = () => !user.loggedIn;
const toggle = () => user.loggedIn = !user.loggedIn;

<template>
  <button {{on 'click' toggle}}>
    Log out
  </button>

  <button {{on 'click' toggle}}>
    Log in
  </button>
</template>
