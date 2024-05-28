import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { modifier } from 'ember-modifier';

let { document } = globalThis;
const bold = () => document.execCommand("bold", false, null);
const italic = () => document.execCommand("italic", false, null);
const underline = () => document.execCommand("underline", false, null);
const list = () => document.execCommand("insertUnorderedList", false, null);

class ControlledInput extends Component {
  <template>
    <div
      contenteditable="true"
    ></div>

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

