import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { TrackedObject } from 'tracked-built-ins';
import { RemoteData } from 'reactiveweb/remote-data';

const DATA_SOURCES = ['people', 'planets'];
// tracked() is @tracked data that can be used anywhere -- makes for smaller demos
// This could be `@tracked selectedAPI = DATA_SOURCES[0];` in a component class
const selectedAPI = tracked(DATA_SOURCES[0]);
const selectedStuff = new TrackedObject();

/////////// Select
// Since we need a few of these for the demo, here is a shared Select component
function handleSelectChange(handler, options, event) {
  let stringValue = event.target.value;
  return handler(stringValue);
}
function isSelected(a, b) {
  return a === b;
}
// for brevity, this only supports an array of strings for @options
const Select = <template>
  <select {{on 'change' (fn handleSelectChange @onChange @options)}}>
    {{#each @options as |item|}}
      <option value={{item}} selected={{isSelected @value item}}>
        {{item}}
      </option>
    {{/each}}
  </select>
</template>;
/////////// End Select

////////////// Demo

function data() {
  return JSON.stringify({ selectedAPI: selectedAPI.value, selectedStuff }, null, 3);
}

function urlForDataSource(selectedData) {
  return `https://swapi.tech/api/${selectedData}/`;
}

function setSelected(propertyName, value) {
  selectedStuff[propertyName] = value;
}

function names(options) {
  return options.map(option => option.name);
}

<template>
  <pre>{{data}}</pre>

  <label>
    Parent Dropdown
    <Select
      @options={{DATA_SOURCES}}
      @onChange={{selectedAPI.set}}
      @selected={{selectedAPI.value}}
    />
  </label>

  <label>
    Select {{selectedAPI.value}}

    {{!
      it's important to model async behavior, and this util makes that a bit easier.
      Docs here: https://ember-resources.pages.dev/funcs/util_remote_data.RemoteData }}
    {{#let (RemoteData (urlForDataSource selectedAPI.value)) as |request|}}
      {{#if request.isLoading}}
        Loading...
      {{/if}}

      {{#if request.value}}
         <Select
           @options={{names request.value.results}}
           @onChange={{fn setSelected selectedAPI.value}}
         />
      {{/if}}
    {{/let}}
  </label>

  <style>
    label {
      border: 1px solid;
      padding: 1rem;
      display: block;
      margin: 0.5rem 0;
    }
    select {
      padding: 0.5rem 1rem;
    }
  </style>
</template>
