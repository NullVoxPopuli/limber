import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class ElementDimensions extends Component {
  @tracked width = 0;
  @tracked height = 0;
  @tracked isResizing = false;
  
  resizeObserver = modifier((element) => {
    // Create a ResizeObserver
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        // Update the component's tracked properties with the new dimensions
        // Using Math.round to avoid decimal values
        this.width = Math.round(entry.contentRect.width);
        this.height = Math.round(entry.contentRect.height);
      }
    });
    
    // Start observing the element
    observer.observe(element);
    
    // Initialize the dimensions
    this.width = Math.round(element.offsetWidth);
    this.height = Math.round(element.offsetHeight);
    
    // Return a cleanup function
    return () => {
      // Clean up the observer
      observer.disconnect();
    };
  });
  
  @action
  toggleResizing() {
    this.isResizing = !this.isResizing;
  }

  <template>
    <div class="demo-container">
      <h3>Element Dimensions Observer</h3>
      
      <div class="controls">
        <button {{on "click" this.toggleResizing}}>
          {{if this.isResizing "Stop Resizing" "Start Resizing"}}
        </button>
      </div>
      
      <div 
        class="resize-box {{if this.isResizing 'resizing'}}"
        {{this.resizeObserver}}
      >
        <div class="dimensions-display">
          <p>Width: {{this.width}}px</p>
          <p>Height: {{this.height}}px</p>
        </div>
      </div>
      
      <div class="instructions">
        <p>{{if this.isResizing "The box is now animated to change size. Watch the dimensions update in real-time!" "Click the button to start the resizing animation."}}</p>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component uses the ResizeObserver API to track changes to the element's dimensions:</p>
        <pre>
const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    this.width = Math.round(entry.contentRect.width);
    this.height = Math.round(entry.contentRect.height);
  }
});

observer.observe(element);

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
      
      .resize-box {
        width: 300px;
        height: 200px;
        border: 2px solid #3498db;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1rem;
        transition: width 0.5s ease, height 0.5s ease;
      }
      
      .resize-box.resizing {
        animation: resize 4s infinite alternate;
      }
      
      @keyframes resize {
        0% {
          width: 300px;
          height: 200px;
        }
        50% {
          width: 400px;
          height: 200px;
        }
        100% {
          width: 350px;
          height: 300px;
        }
      }
      
      .dimensions-display {
        background-color: rgba(255, 255, 255, 0.8);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-align: center;
      }
      
      .dimensions-display p {
        margin: 0.25rem 0;
        font-weight: bold;
      }
      
      .instructions {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
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
  <h2>Observing Element Dimensions</h2>
  <ElementDimensions />
</template>
