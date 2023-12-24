import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

class Demo extends Component {
  <template>
    isOn: {{this.isOn}}

    <button type="button" {{on 'click' this.toggle}}>external change</button>
  </template>

  @tracked isOn = true;

  toggle = () => this.isOn = !this.isOn;
}

<template>
  <script src="https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic.js"></script>

  <Demo />
</template>
