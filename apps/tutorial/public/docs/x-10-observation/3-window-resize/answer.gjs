import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class WindowResize extends Component {
  @tracked windowWidth = window.innerWidth;
  @tracked windowHeight = window.innerHeight;
  @tracked isObserving = false;
  @tracked debounceTime = 250; // ms
  @tracked lastResizeTime = null;
  @tracked resizeCount = 0;
  
  // Implement a debounce function to limit how often the resize handler is called
  debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }
  
  // Implement a window resize modifier that updates width and height
  windowResizeObserver = modifier(() => {
    // Create a resize handler function
    const handleResize = this.debounce(() => {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
      this.lastResizeTime = new Date().toLocaleTimeString();
      this.resizeCount++;
    }, this.debounceTime);
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Initialize the values
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.lastResizeTime = new Date().toLocaleTimeString();
    
    // Return a cleanup function
    return () => {
      // Clean up the event listener
      window.removeEventListener('resize', handleResize);
    };
  });
  
  @action
  toggleObserving() {
    this.isObserving = !this.isObserving;
    if (this.isObserving) {
      this.resizeCount = 0;
    }
  }
  
  @action
  updateDebounceTime(event) {
    this.debounceTime = parseInt(event.target.value, 10);
  }

  <template>
    <div class="demo-container" {{if this.isObserving this.windowResizeObserver}}>
      <h3>Window Resize Observer</h3>
      
      <div class="controls">
        <button {{on "click" this.toggleObserving}}>
          {{if this.isObserving "Stop Observing" "Start Observing"}}
        </button>
        
        <div class="debounce-control">
          <label for="debounce-time">Debounce Time (ms):</label>
          <input 
            type="range" 
            id="debounce-time" 
            min="0" 
            max="1000" 
            step="50" 
            value={{this.debounceTime}} 
            {{on "input" this.updateDebounceTime}}
          />
          <span>{{this.debounceTime}}ms</span>
        </div>
      </div>
      
      <div class="dimensions-display">
        <div class="dimension-box">
          <h4>Window Width</h4>
          <div class="dimension-value">{{this.windowWidth}}px</div>
        </div>
        
        <div class="dimension-box">
          <h4>Window Height</h4>
          <div class="dimension-value">{{this.windowHeight}}px</div>
        </div>
      </div>
      
      {{#if this.isObserving}}
        <div class="stats">
          <p>Last resize: {{this.lastResizeTime}}</p>
          <p>Resize events handled: {{this.resizeCount}}</p>
          <p>Try resizing your window quickly and observe how the debounce time affects the update frequency.</p>
        </div>
      {{/if}}
      
      <div class="instructions">
        <p>{{if this.isObserving "Resize your browser window to see the dimensions update in real-time!" "Click the 'Start Observing' button to begin tracking window resize events."}}</p>
        <p>{{if this.isObserving "Adjust the debounce slider to control how responsive the updates are. A higher value means less frequent updates during rapid resizing." ""}}</p>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component uses a window resize event listener with debouncing:</p>
        <pre>
// Debounce function
debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Resize handler with debouncing
const handleResize = this.debounce(() => {
  this.windowWidth = window.innerWidth;
  this.windowHeight = window.innerHeight;
}, this.debounceTime);

// Add event listener
window.addEventListener('resize', handleResize);

// Cleanup when the component is destroyed
return () => {
  window.removeEventListener('resize', handleResize);
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
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      
      button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        width: fit-content;
      }
      
      .debounce-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .debounce-control input {
        flex: 1;
      }
      
      .dimensions-display {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      
      .dimension-box {
        flex: 1;
        padding: 1rem;
        border: 2px solid #3498db;
        border-radius: 4px;
        text-align: center;
      }
      
      .dimension-box h4 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      
      .dimension-value {
        font-size: 2rem;
        font-weight: bold;
      }
      
      .stats {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background-color: #e1f5fe;
        border-radius: 4px;
      }
      
      .stats p {
        margin: 0.5rem 0;
      }
      
      .instructions {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        margin-bottom: 1.5rem;
      }
      
      .explanation {
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
  <h2>Observing Window Resize</h2>
  <WindowResize />
</template>
