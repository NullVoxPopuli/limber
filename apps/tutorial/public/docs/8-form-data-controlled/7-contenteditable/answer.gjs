import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { modifier } from 'ember-modifier';

const bold = () => document.execCommand("bold", false, null);
const italic = () => document.execCommand("italic", false, null);
const underline = () => document.execCommand("underline", false, null);
const list = () => document.execCommand("insertUnorderedList", false, null);

const setContent = modifier((element, [initialize]) => {
  (async () => {
    // Disconnect from auto-tracking
    // so we can only set the inner HTML once
    await Promise.resolve();
    initialize(element);
  })();
});

class ControlledInput extends Component {
  handleChange = (event) => {
    let content = event.target;

    this.args.onChange(content.innerHTML);
  }

  setValue = (element) => element.innerHTML = this.args.value;

  <template>
    <div
      contenteditable="true"
      {{setContent this.setValue}}
      {{on 'input' this.handleChange}}></div>

    <button {{on "click" bold}}>Bold</button>
    <button {{on "click" italic}}>Italic</button>
    <button {{on "click" underline}}>Underline</button>
    <button {{on "click" list}}>List</button>
  </template>
}

// Below is only setup for the tutorial chapter
// and not exactly relevent to the topic
class State {
  @tracked value = "initial text";
  handleChange = (newValue) => this.value = newValue;
}
const createState = () => new State();


<template>
  {{#let (createState) as |x|}}
    <ControlledInput @value={{x.value}} @onChange={{x.handleChange}} />

    <pre>{{x.value}}</pre>
  {{/let}}


  <style>
    [contenteditable] {
      border: 1px solid;
      display: block;
      padding: 0.25rem;
      margin-bottom: 1rem;
    }
  </style>
</template>

