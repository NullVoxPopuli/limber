import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class StandaloneInputsDemo extends Component {
  // TODO: Add tracked properties for input values
  
  // TODO: Add computed properties for derived values
  
  // TODO: Add validation methods
  
  // TODO: Add submit action
  
  <template>
    <div class="demo-container">
      <h3>Standalone Inputs Demo</h3>
      
      <div class="section">
        <h4>Basic Inputs</h4>
        
        <div class="input-group">
          <label for="name-input">Name:</label>
          {{! TODO: Add a controlled text input }}
        </div>
        
        <div class="input-group">
          <label for="age-input">Age:</label>
          {{! TODO: Add a controlled number input }}
        </div>
        
        <div class="input-group">
          <label class="checkbox-label">
            {{! TODO: Add a controlled checkbox input }}
            Subscribe to newsletter
          </label>
        </div>
      </div>
      
      <div class="section">
        <h4>Validation Example</h4>
        
        <div class="input-group">
          <label for="email-input">Email:</label>
          {{! TODO: Add a controlled email input with validation }}
          
          {{! TODO: Add validation feedback }}
        </div>
        
        <div class="input-group">
          <label for="password-input">Password:</label>
          {{! TODO: Add a controlled password input with validation }}
          
          {{! TODO: Add validation feedback }}
        </div>
      </div>
      
      <div class="section">
        <h4>Live Preview</h4>
        
        <div class="preview-container">
          {{! TODO: Add a preview that updates as inputs change }}
        </div>
      </div>
      
      <div class="section">
        <h4>Submit Action</h4>
        
        <button 
          type="button" 
          class="submit-button"
        >
          Submit
        </button>
        
        <div class="result">
          {{! TODO: Display submission result }}
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
      
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      input[type="text"],
      input[type="number"],
      input[type="email"],
      input[type="password"] {
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
      
      .preview-container {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .submit-button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .submit-button:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
      }
      
      .result {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
    </style>
  </template>
}

<template>
  <h2>Standalone Inputs in Ember</h2>
  <StandaloneInputsDemo />
</template>
