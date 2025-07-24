import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { modifier } from 'ember-modifier';

// TODO: Create a custom conditional modifier

class ConditionalModifiersDemo extends Component {
  // TODO: Add tracked properties for component state
  
  // TODO: Add action methods for event handling
  
  <template>
    <div class="demo-container">
      <h3>Conditional Modifiers Demo</h3>
      
      <div class="section">
        <h4>Conditional Event Listeners</h4>
        
        <div class="demo-box">
          {{! TODO: Add a button with conditional event listeners }}
          
          <div class="result-display">
            {{! TODO: Display the result of button interactions }}
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Toggle Button with Different Modifiers</h4>
        
        <div class="demo-box">
          {{! TODO: Add a toggle button with different modifiers based on state }}
          
          <div class="result-display">
            {{! TODO: Display the toggle state }}
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Hover Card with Conditional Modifiers</h4>
        
        <div class="demo-box">
          {{! TODO: Add a hover card with conditional mouse interaction modifiers }}
        </div>
      </div>
      
      <div class="section">
        <h4>Custom Conditional Modifier</h4>
        
        <div class="demo-box">
          {{! TODO: Add elements that use a custom conditional modifier }}
          
          <div class="controls">
            {{! TODO: Add controls to change the condition }}
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 600px;
      }
      
      .section {
        margin-bottom: 2rem;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .demo-box {
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
      
      button:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
      }
      
      button.active {
        background-color: #2ecc71;
      }
      
      .result-display {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        min-height: 2rem;
      }
      
      .hover-card {
        padding: 1rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        transition: all 0.3s ease;
      }
      
      .hover-card.active {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-4px);
      }
      
      .controls {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
      }
      
      .custom-element {
        padding: 1rem;
        margin-bottom: 0.5rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        transition: all 0.3s ease;
      }
    </style>
  </template>
}

<template>
  <h2>Conditional Modifiers in Ember</h2>
  <ConditionalModifiersDemo />
</template>
