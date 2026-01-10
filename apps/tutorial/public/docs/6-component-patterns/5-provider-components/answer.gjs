import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

class ToggleProvider extends Component {
  @tracked isEnabled = false;

  toggle = () => this.isEnabled = !this.isEnabled;

  <template>
    {{yield this.isEnabled this.toggle}}
  </template>
}

<template>
  <ToggleProvider as |isEnabled toggle|>
    <p>isEnabled: {{isEnabled}}</p>
    <button {{on 'click' toggle}}>toggle</button>
  </ToggleProvider>
</template>
