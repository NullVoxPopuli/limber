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
  
  @action
  updateSelectedFruits(event) {
    // Convert the HTMLCollection to an array of values
    this.selectedFruits = Array.from(event.target.selectedOptions).map(option => option.value);
  }
  
  @action
  handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // Use getAll() to retrieve all selected values
    const selectedFruits = formData.getAll('fruits');
    
    this.formData = {
      name: formData.get('name'),
      email: formData.get('email'),
      fruits: selectedFruits
    };
    
    console.log('Form submitted:', this.formData);
  }
  
  get selectedFruitNames() {
    return this.selectedFruits.map(value => {
      const fruit = this.fruits.find(f => f.value === value);
      return fruit ? fruit.name : value;
    });
  }

  <template>
    <div class="demo-container">
      <h3>Multiple Select Demo</h3>
      
      <div class="section">
        <h4>Controlled Multiple Select</h4>
        
        <div class="select-container">
          <label for="controlled-select">Select your favorite fruits:</label>
          
          <select 
            id="controlled-select" 
            multiple 
            class="custom-multi-select"
            {{on "change" this.updateSelectedFruits}}
          >
            {{#each this.fruits as |fruit|}}
              <option value={{fruit.value}} selected={{includes this.selectedFruits fruit.value}}>
                {{fruit.name}}
              </option>
            {{/each}}
          </select>
          
          <p class="hint">Hold Ctrl (or Cmd on Mac) to select multiple options</p>
        </div>
        
        <div class="result">
          <p>Selected fruits:</p>
          {{#if this.selectedFruits.length}}
            <ul>
              {{#each this.selectedFruitNames as |fruitName|}}
                <li>{{fruitName}}</li>
              {{/each}}
            </ul>
          {{else}}
            <p>No fruits selected</p>
          {{/if}}
        </div>
      </div>
      
      <div class="section">
        <h4>Form Data Example</h4>
        
        <form {{on "submit" this.handleFormSubmit}}>
          <div class="form-group">
            <label for="name">Your Name</label>
            <input type="text" id="name" name="name" class="form-control">
          </div>
          
          <div class="form-group">
            <label for="email">Your Email</label>
            <input type="email" id="email" name="email" class="form-control">
          </div>
          
          <div class="form-group">
            <label for="form-select">Select your favorite fruits:</label>
            <select id="form-select" name="fruits" multiple class="custom-multi-select">
              {{#each this.fruits as |fruit|}}
                <option value={{fruit.value}}>{{fruit.name}}</option>
              {{/each}}
            </select>
            <p class="hint">Hold Ctrl (or Cmd on Mac) to select multiple options</p>
          </div>
          
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
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates two key concepts with multiple select inputs:</p>
        
        <ol>
          <li>
            <strong>Controlled Multiple Select:</strong> The fruit selection uses a tracked property and an event handler to maintain its state:
            <pre>
@tracked selectedFruits = [];

@action
updateSelectedFruits(event) {
  // Convert the HTMLCollection to an array of values
  this.selectedFruits = Array.from(event.target.selectedOptions)
    .map(option => option.value);
}
            </pre>
          </li>
          
          <li>
            <strong>FormData API:</strong> The form example uses FormData.getAll() to collect all selected values:
            <pre>
const formData = new FormData(event.target);

// Use getAll() to retrieve all selected values
const selectedFruits = formData.getAll('fruits');
            </pre>
          </li>
        </ol>
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
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      .form-control {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .custom-multi-select {
        width: 100%;
        min-height: 150px;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .custom-multi-select option {
        padding: 0.5rem;
        margin-bottom: 0.25rem;
        border-radius: 4px;
      }
      
      .custom-multi-select option:checked {
        background-color: #3498db;
        color: white;
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
        background-color: #f1f1f1;
        padding: 0.5rem;
        border-radius: 4px;
        overflow-x: auto;
      }
      
      .explanation {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
    </style>
  </template>
}

<template>
  <h2>Multiple Select in Ember</h2>
  <MultiSelectDemo />
</template>
