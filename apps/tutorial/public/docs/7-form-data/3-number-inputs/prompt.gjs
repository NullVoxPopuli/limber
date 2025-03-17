import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class NumberInputDemo extends Component {
  @tracked value = 5;
  @tracked error = null;
  
  // Minimum and maximum allowed values
  minValue = 0;
  maxValue = 10;
  
  // TODO: Implement the update handler to convert the string value to a number
  // and validate that it's within the allowed range
  
  <template>
    <div class="demo-container">
      <h3>Number Input Demo</h3>
      
      <div class="input-container">
        <label for="quantity">Quantity ({{this.minValue}}-{{this.maxValue}}):</label>
        
        {{! TODO: Add a controlled number input with min, max, and step attributes }}
        
      </div>
      
      {{#if this.error}}
        <div class="error-message">{{this.error}}</div>
      {{/if}}
      
      <div class="value-display">
        <p>Current value: <strong>{{this.value}}</strong></p>
        <p>Value type: <strong>{{typeof this.value}}</strong></p>
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 400px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .input-container {
        margin-bottom: 1rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      
      input[type="number"] {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 100%;
      }
      
      .error-message {
        color: #e74c3c;
        margin-bottom: 1rem;
      }
      
      .value-display {
        background-color: #f8f9fa;
        padding: 0.5rem;
        border-radius: 4px;
      }
    </style>
  </template>
}

<template>
  <h2>Number Input Example</h2>
  <NumberInputDemo />
</template>
