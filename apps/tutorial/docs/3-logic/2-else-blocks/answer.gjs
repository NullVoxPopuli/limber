import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class User {
  @tracked loggedIn = false;
}

const user = new User();
const notLoggedIn = () => !user.loggedIn;
const toggle = () => user.loggedIn = !user.loggedIn;

<template>
  Logged in: {{user.loggedIn}}<br>

  {{#if user.loggedIn}}
    <button {{on 'click' toggle}}>
      Log out
    </button>
  {{else}}
    <button {{on 'click' toggle}}>
      Log in
    </button>
  {{/if}}
</template>
