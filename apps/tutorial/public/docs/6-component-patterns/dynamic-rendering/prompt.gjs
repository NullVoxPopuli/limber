import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

// TODO: Create simple components that will be dynamically rendered

class DynamicRenderingDemo extends Component {
  // TODO: Add tracked properties for component selection
  
  // TODO: Add computed properties for dynamic component selection
  
  // TODO: Add actions for changing the selected component
  
  <template>
    <div class="demo-container">
      <h3>Dynamic Rendering Demo</h3>
      
      <div class="controls">
        {{! TODO: Add controls for selecting components }}
      </div>
      
      <div class="component-display">
        {{! TODO: Dynamically render the selected component }}
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 600px;
      }
      
      .controls {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      button.active {
        background-color: #2ecc71;
      }
      
      .component-display {
        padding: 1rem;
        min-height: 200px;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    </style>
  </template>
}

<template>
  <h2>Dynamic Rendering in Ember</h2>
  <DynamicRenderingDemo />
</template>
