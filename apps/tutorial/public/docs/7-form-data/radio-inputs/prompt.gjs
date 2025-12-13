import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class RadioInputDemo extends Component {
  @tracked selectedColor = null;
  @tracked formData = null;
  
  colors = [
    { id: 'red', name: 'Red', hex: '#e74c3c' },
    { id: 'blue', name: 'Blue', hex: '#3498db' },
    { id: 'green', name: 'Green', hex: '#2ecc71' },
    { id: 'purple', name: 'Purple', hex: '#9b59b6' },
    { id: 'yellow', name: 'Yellow', hex: '#f1c40f' }
  ];
  
  // TODO: Implement the update handler for the radio group
  
  // TODO: Implement the form submission handler
  
  <template>
    <div class="demo-container">
      <h3>Radio Input Demo</h3>
      
      <div class="section">
        <h4>Controlled Radio Group</h4>
        
        <fieldset class="radio-group">
          <legend>Select your favorite color:</legend>
          
          {{! TODO: Add radio inputs for each color }}
          
        </fieldset>
        
        <div class="result">
          {{#if this.selectedColor}}
            <p>You selected: <span class="color-preview" style="background-color: {{this.selectedColor.hex}}"></span> <strong>{{this.selectedColor.name}}</strong></p>
          {{else}}
            <p>No color selected</p>
          {{/if}}
        </div>
      </div>
      
      <div class="section">
        <h4>Form Data Example</h4>
        
        <form>
          {{! TODO: Add a form with radio inputs that uses FormData }}
          
          <button type="submit">Submit</button>
        </form>
        
        <div class="result">
          {{#if this.formData}}
            <p>Form data:</p>
            <pre>{{JSON.stringify this.formData null 2}}</pre>
          {{else}}
            <p>Form data will appear here after submission</p>
          {{/if}}
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
      
      .radio-group {
        border: 1px solid #ddd;
        padding: 1rem;
        margin-bottom: 1rem;
      }
      
      legend {
        padding: 0 0.5rem;
      }
      
      .radio-option {
        margin-bottom: 0.5rem;
      }
      
      .color-preview {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        margin-right: 0.25rem;
        vertical-align: middle;
      }
      
      .result {
        margin-top: 1rem;
        padding: 0.5rem;
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
      
      pre {
        margin: 0;
        white-space: pre-wrap;
      }
    </style>
  </template>
}

<template>
  <h2>Radio Inputs in Ember</h2>
  <RadioInputDemo />
</template>
