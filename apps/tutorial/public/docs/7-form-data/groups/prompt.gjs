import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class FormGroupsDemo extends Component {
  // TODO: Create tracked objects for each form group
  
  // TODO: Implement update handlers for each form group
  
  // TODO: Implement the form submission handler
  
  <template>
    <div class="demo-container">
      <h3>Form Groups Demo</h3>
      
      <form>
        {{! TODO: Add form groups with fieldset and legend }}
        
        <button type="submit" class="submit-button">Submit</button>
      </form>
      
      <div class="preview-container">
        <div class="preview-section">
          <h4>Form Data Preview</h4>
          <div class="data-preview">
            {{! TODO: Display the current form data }}
            <p class="empty-message">Form data will appear here as you type</p>
          </div>
        </div>
        
        <div class="preview-section">
          <h4>Submission Result</h4>
          <div class="result-preview">
            {{! TODO: Display the form submission result }}
            <p class="empty-message">Form submission result will appear here</p>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 800px;
      }
      
      form {
        margin-bottom: 2rem;
      }
      
      fieldset {
        margin-bottom: 1.5rem;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      legend {
        padding: 0 0.5rem;
        font-weight: bold;
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      
      input, select, textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .form-row {
        display: flex;
        gap: 1rem;
      }
      
      .form-row .form-group {
        flex: 1;
      }
      
      .submit-button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .preview-container {
        display: flex;
        gap: 1rem;
      }
      
      .preview-section {
        flex: 1;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .data-preview, .result-preview {
        padding: 1rem;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .empty-message {
        color: #999;
        font-style: italic;
      }
      
      pre {
        margin: 0;
        white-space: pre-wrap;
      }
    </style>
  </template>
}

<template>
  <h2>Form Groups in Ember</h2>
  <FormGroupsDemo />
</template>
