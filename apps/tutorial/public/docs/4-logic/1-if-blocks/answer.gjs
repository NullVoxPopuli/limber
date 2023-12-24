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
    <button type="button" {{on 'click' toggle}}>
      Log out
    </button>
  {{/if}}

  {{#if (notLoggedIn)}}
    <button type="button" {{on 'click' toggle}}>
      Log in
    </button>
  {{/if}}
</template>
