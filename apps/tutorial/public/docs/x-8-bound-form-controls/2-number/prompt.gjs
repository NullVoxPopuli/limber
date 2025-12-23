import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class NumberInputDemo extends Component {
  // TODO: Add tracked properties for numeric values
  
  // TODO: Add validation properties
  
  // TODO: Add calculator properties
  
  // TODO: Implement update handlers for inputs
  
  // TODO: Implement validation methods
  
  // TODO: Implement calculator methods
  
  <template>
    <div class="demo-container">
      <h3>Number Input Demo</h3>
      
      <div class="section">
        <h4>Basic Number Input</h4>
        
        <div class="input-group">
          <label for="basic-number">Enter a number:</label>
          {{! TODO: Add a controlled number input }}
          
          <div class="value-display">
            Current value: <span class="value">{{! TODO: Display the current value }}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Number Input with Validation</h4>
        
        <div class="input-group">
          <label for="validated-number">Enter a number (0-100):</label>
          {{! TODO: Add a number input with validation }}
          
          {{! TODO: Add validation feedback }}
          
          <div class="value-display">
            Current value: <span class="value">{{! TODO: Display the current value }}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Numeric Slider</h4>
        
        <div class="slider-container">
          {{! TODO: Add a range input (slider) }}
          
          <div class="slider-value">
            {{! TODO: Display the slider value }}
          </div>
        </div>
        
        <div class="input-group">
          <label for="slider-number">Fine-tune the value:</label>
          {{! TODO: Add a number input synchronized with the slider }}
        </div>
      </div>
      
      <div class="section">
        <h4>Simple Calculator</h4>
        
        <div class="calculator">
          <div class="input-row">
            <div class="input-group">
              <label for="calc-num1">First number:</label>
              {{! TODO: Add first number input }}
            </div>
            
            <div class="operation-selector">
              {{! TODO: Add operation selector }}
            </div>
            
            <div class="input-group">
              <label for="calc-num2">Second number:</label>
              {{! TODO: Add second number input }}
            </div>
          </div>
          
          <button type="button" class="calculate-button">
            Calculate
          </button>
          
          <div class="result">
            {{! TODO: Display calculation result }}
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
      
      .input-group {
        margin-bottom: 1rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      
      input[type="number"] {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      input.invalid {
        border-color: #e74c3c;
      }
      
      .validation-message {
        margin-top: 0.25rem;
        font-size: 0.875rem;
      }
      
      .validation-message.error {
        color: #e74c3c;
      }
      
      .validation-message.success {
        color: #2ecc71;
      }
      
      .value-display {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: #666;
      }
      
      .value {
        font-weight: bold;
        color: #333;
      }
      
      .slider-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      
      input[type="range"] {
        flex: 1;
      }
      
      .slider-value {
        min-width: 3rem;
        text-align: center;
        font-weight: bold;
      }
      
      .calculator {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .input-row {
        display: flex;
        align-items: flex-end;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      
      .operation-selector {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .calculate-button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .result {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #eee;
        border-radius: 4px;
        text-align: center;
      }
      
      .result-value {
        font-size: 1.25rem;
        font-weight: bold;
      }
    </style>
  </template>
}

<template>
  <h2>Number Inputs in Ember</h2>
  <NumberInputDemo />
</template>
