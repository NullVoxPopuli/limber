import Component from '@glimmer/component';

// Helper function to find DOM elements
const findElement = (selector) => document.querySelector(selector);

class Portal extends Component {
  <template>
    {{! The portal target where content will be rendered }}
    <div id="portal-target" class="portal-target"></div>
    
    <div class="portal-source">
      {{! Use in-element to render the yielded content in the portal-target }}
      {{#in-element (findElement '#portal-target')}}
        {{yield}}
      {{/in-element}}
    </div>
  </template>
}

<template>
  <Portal>
    <div class="portal-content">
      This content should appear in the portal target!
    </div>
  </Portal>

  <style>
    .portal-target {
      border: 2px dashed blue;
      padding: 1rem;
      margin-bottom: 1rem;
      min-height: 50px;
    }
    
    .portal-source {
      background-color: #f0f0f0;
      padding: 1rem;
    }
    
    .portal-content {
      background-color: #e0e0ff;
      padding: 0.5rem;
      border-radius: 4px;
    }
  </style>
</template>
