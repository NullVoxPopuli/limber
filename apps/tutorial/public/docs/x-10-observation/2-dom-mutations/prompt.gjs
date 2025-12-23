import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class DomMutations extends Component {
  @tracked mutations = [];
  @tracked maxMutations = 10;
  
  // TODO: Implement a mutation observer modifier that tracks DOM changes
  mutationObserver = modifier((element) => {
    // Create a MutationObserver
    
    // Configure and start observing the element
    
    // Return a cleanup function
    return () => {
      // Clean up the observer
    };
  });
  
  @action
  addElement() {
    // This will be implemented to add a new element to the observed container
  }
  
  @action
  removeElement() {
    // This will be implemented to remove an element from the observed container
  }
  
  @action
  changeAttribute() {
    // This will be implemented to change an attribute on an element in the observed container
  }
  
  @action
  changeText() {
    // This will be implemented to change text content in the observed container
  }
  
  @action
  clearMutations() {
    this.mutations = [];
  }

  <template>
    <div class="demo-container">
      <h3>DOM Mutations Observer</h3>
      
      <div class="controls">
        <button {{on "click" this.addElement}}>Add Element</button>
        <button {{on "click" this.removeElement}}>Remove Element</button>
        <button {{on "click" this.changeAttribute}}>Change Attribute</button>
        <button {{on "click" this.changeText}}>Change Text</button>
        <button {{on "click" this.clearMutations}}>Clear Log</button>
      </div>
      
      <div 
        class="observed-container"
        {{this.mutationObserver}}
      >
        <p id="text-element">This is a text element that can be modified</p>
        <div id="attribute-element" class="normal">This element's attributes can change</div>
        <div id="children-container">
          <!-- Child elements will be added and removed here -->
        </div>
      </div>
      
      <div class="mutations-log">
        <h4>Mutations Log</h4>
        {{#if this.mutations.length}}
          <ul>
            {{#each this.mutations as |mutation|}}
              <li>{{mutation}}</li>
            {{/each}}
          </ul>
        {{else}}
          <p>No mutations detected yet. Try using the controls above.</p>
        {{/if}}
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 600px;
      }
      
      .controls {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      
      button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .observed-container {
        padding: 1rem;
        border: 2px solid #3498db;
        border-radius: 4px;
        margin-bottom: 1rem;
      }
      
      .normal {
        background-color: #f8f9fa;
        padding: 0.5rem;
        border-radius: 4px;
      }
      
      .highlighted {
        background-color: #ffe066;
        padding: 0.5rem;
        border-radius: 4px;
        font-weight: bold;
      }
      
      #children-container {
        margin-top: 1rem;
        padding: 0.5rem;
        border: 1px dashed #ccc;
        min-height: 50px;
      }
      
      .mutations-log {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .mutations-log ul {
        margin: 0;
        padding-left: 1.5rem;
      }
      
      .mutations-log li {
        margin-bottom: 0.25rem;
      }
      
      .child-element {
        margin: 0.5rem 0;
        padding: 0.5rem;
        background-color: #e1f5fe;
        border-radius: 4px;
      }
    </style>
  </template>
}

<template>
  <h2>Observing DOM Mutations</h2>
  <DomMutations />
</template>
