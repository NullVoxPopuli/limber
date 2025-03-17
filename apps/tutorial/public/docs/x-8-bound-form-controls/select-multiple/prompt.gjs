import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class MultiSelectDemo extends Component {
  // TODO: Add tracked properties for selected options
  
  // TODO: Define options for the multiple select
  
  // TODO: Implement update handlers
  
  // TODO: Implement form submission handler
  
  <template>
    <div class="demo-container">
      <h3>Multiple Select Demo</h3>
      
      <div class="section">
        <h4>Basic Multiple Select</h4>
        
        <div class="input-group">
          <label for="basic-multiselect">Select multiple options:</label>
          {{! TODO: Add a controlled multiple select }}
          <p class="hint">Hold Ctrl (or Cmd on Mac) to select multiple options</p>
          
          <div class="selection-display">
            <h5>Selected Options:</h5>
            <div class="selected-options">
              {{! TODO: Display the selected options }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Styled Multiple Select</h4>
        
        <div class="input-group">
          <label for="styled-multiselect">Select multiple items:</label>
          {{! TODO: Add a styled multiple select }}
          
          <div class="selection-display">
            <h5>Selected Items:</h5>
            <div class="selected-options">
              {{! TODO: Display the selected items }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Form with Multiple Select</h4>
        
        <form>
          {{! TODO: Add a form with multiple select }}
          
          <button type="submit">Submit</button>
        </form>
        
        <div class="result">
          {{! TODO: Display form submission result }}
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
      
      select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      select[multiple] {
        min-height: 150px;
      }
      
      .hint {
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: #666;
        font-style: italic;
      }
      
      .selection-display {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .selection-display h5 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      
      .selected-options {
        padding: 0.5rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        min-height: 3rem;
      }
      
      .selected-option {
        display: inline-block;
        margin: 0.25rem;
        padding: 0.25rem 0.5rem;
        background-color: #e1f5fe;
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
  <h2>Multiple Select Inputs in Ember</h2>
  <MultiSelectDemo />
</template>
