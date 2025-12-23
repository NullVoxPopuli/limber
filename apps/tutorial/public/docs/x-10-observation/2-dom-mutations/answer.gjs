import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class DomMutations extends Component {
  @tracked mutations = [];
  @tracked maxMutations = 10;
  @tracked childCount = 0;
  
  mutationObserver = modifier((element) => {
    // Create a MutationObserver
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        this.handleMutation(mutation);
      }
    });
    
    // Configure and start observing the element
    observer.observe(element, {
      childList: true,      // Observe direct children
      attributes: true,     // Observe attributes
      characterData: true,  // Observe text content
      subtree: true         // Observe all descendants
    });
    
    // Return a cleanup function
    return () => {
      // Clean up the observer
      observer.disconnect();
    };
  });
  
  handleMutation(mutation) {
    let mutationInfo = '';
    
    // Format the mutation information based on its type
    if (mutation.type === 'childList') {
      if (mutation.addedNodes.length > 0) {
        mutationInfo = `Added ${mutation.addedNodes.length} node(s) to ${this.getElementDescription(mutation.target)}`;
      } else if (mutation.removedNodes.length > 0) {
        mutationInfo = `Removed ${mutation.removedNodes.length} node(s) from ${this.getElementDescription(mutation.target)}`;
      }
    } else if (mutation.type === 'attributes') {
      mutationInfo = `Changed attribute '${mutation.attributeName}' on ${this.getElementDescription(mutation.target)}`;
    } else if (mutation.type === 'characterData') {
      mutationInfo = `Changed text content in ${this.getElementDescription(mutation.target.parentNode)}`;
    }
    
    // Add the mutation to the log
    this.addMutationToLog(mutationInfo);
  }
  
  getElementDescription(element) {
    if (element.id) {
      return `#${element.id}`;
    } else if (element.className) {
      return `.${element.className.replace(/\s+/g, '.')}`;
    } else {
      return element.tagName.toLowerCase();
    }
  }
  
  addMutationToLog(mutationInfo) {
    // Add the mutation to the beginning of the array
    this.mutations = [mutationInfo, ...this.mutations];
    
    // Limit the number of mutations in the log
    if (this.mutations.length > this.maxMutations) {
      this.mutations = this.mutations.slice(0, this.maxMutations);
    }
  }
  
  @action
  addElement() {
    const container = document.getElementById('children-container');
    if (container) {
      this.childCount++;
      const newElement = document.createElement('div');
      newElement.className = 'child-element';
      newElement.textContent = `Child Element ${this.childCount}`;
      container.appendChild(newElement);
    }
  }
  
  @action
  removeElement() {
    const container = document.getElementById('children-container');
    if (container && container.children.length > 0) {
      container.removeChild(container.lastChild);
    }
  }
  
  @action
  changeAttribute() {
    const element = document.getElementById('attribute-element');
    if (element) {
      // Toggle between normal and highlighted classes
      if (element.className === 'normal') {
        element.className = 'highlighted';
      } else {
        element.className = 'normal';
      }
    }
  }
  
  @action
  changeText() {
    const element = document.getElementById('text-element');
    if (element) {
      // Toggle between two different text contents
      if (element.textContent === 'This is a text element that can be modified') {
        element.textContent = 'The text content has been changed!';
      } else {
        element.textContent = 'This is a text element that can be modified';
      }
    }
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
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component uses the MutationObserver API to track changes to the DOM:</p>
        <pre>
const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    this.handleMutation(mutation);
  }
});

observer.observe(element, {
  childList: true,      // Observe direct children
  attributes: true,     // Observe attributes
  characterData: true,  // Observe text content
  subtree: true         // Observe all descendants
});

// Cleanup when the component is destroyed
return () => {
  observer.disconnect();
};
        </pre>
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
        margin-bottom: 1rem;
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
      
      .explanation {
        margin-top: 1.5rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      pre {
        background-color: #f1f1f1;
        padding: 0.5rem;
        border-radius: 4px;
        overflow-x: auto;
      }
    </style>
  </template>
}

<template>
  <h2>Observing DOM Mutations</h2>
  <DomMutations />
</template>
