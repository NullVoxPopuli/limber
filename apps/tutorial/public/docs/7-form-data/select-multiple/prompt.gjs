import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class MultiSelectDemo extends Component {
  @tracked selectedFruits = [];
  @tracked formData = null;
  
  fruits = [
    { id: 1, name: 'Apple', value: 'apple' },
    { id: 2, name: 'Banana', value: 'banana' },
    { id: 3, name: 'Orange', value: 'orange' },
    { id: 4, name: 'Strawberry', value: 'strawberry' },
    { id: 5, name: 'Pineapple', value: 'pineapple' },
    { id: 6, name: 'Mango', value: 'mango' },
    { id: 7, name: 'Kiwi', value: 'kiwi' },
    { id: 8, name: 'Grapes', value: 'grapes' }
  ];
  
  // TODO: Implement the update handler for the multiple select
  
  // TODO: Implement the form submission handler
  
  <template>
    <div class="demo-container">
      <h3>Multiple Select Demo</h3>
      
      <div class="section">
        <h4>Controlled Multiple Select</h4>
        
        <div class="select-container">
          <label for="controlled-select">Select your favorite fruits:</label>
          
          {{! TODO: Add a controlled multiple select }}
          
          <p class="hint">Hold Ctrl (or Cmd on Mac) to select multiple options</p>
        </div>
        
        <div class="result">
          <p>Selected fruits:</p>
          {{#if this.selectedFruits.length}}
            <ul>
              {{#each this.selectedFruits as |fruit|}}
                <li>{{fruit}}</li>
              {{/each}}
            </ul>
          {{else}}
            <p>No fruits selected</p>
          {{/if}}
        </div>
      </div>
      
      <div class="section">
        <h4>Form Data Example</h4>
        
        <form>
          {{! TODO: Add a form with a multiple select that uses FormData }}
          
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
      
      .select-container {
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
      
      .hint {
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: #666;
        font-style: italic;
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
  <h2>Multiple Select in Ember</h2>
  <MultiSelectDemo />
</template>
