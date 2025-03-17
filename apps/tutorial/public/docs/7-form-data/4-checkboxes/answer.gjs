import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class CheckboxDemo extends Component {
  @tracked isSubscribed = false;
  @tracked selectedFruits = [];
  @tracked allFruitsSelected = false;
  @tracked formData = null;
  
  fruits = [
    { id: 1, name: 'Apple', value: 'apple' },
    { id: 2, name: 'Banana', value: 'banana' },
    { id: 3, name: 'Orange', value: 'orange' },
    { id: 4, name: 'Strawberry', value: 'strawberry' },
    { id: 5, name: 'Pineapple', value: 'pineapple' }
  ];
  
  @action
  updateSubscription(event) {
    this.isSubscribed = event.target.checked;
  }
  
  @action
  updateFruitSelection(event) {
    const { value, checked } = event.target;
    
    if (checked) {
      // Add the fruit to the selected list if it's not already there
      if (!this.selectedFruits.includes(value)) {
        this.selectedFruits = [...this.selectedFruits, value];
      }
    } else {
      // Remove the fruit from the selected list
      this.selectedFruits = this.selectedFruits.filter(fruit => fruit !== value);
    }
    
    // Update the "Select All" checkbox state
    this.allFruitsSelected = this.selectedFruits.length === this.fruits.length;
  }
  
  @action
  toggleAllFruits(event) {
    const checked = event.target.checked;
    this.allFruitsSelected = checked;
    
    if (checked) {
      // Select all fruits
      this.selectedFruits = this.fruits.map(fruit => fruit.value);
    } else {
      // Deselect all fruits
      this.selectedFruits = [];
    }
  }
  
  @action
  handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // For single checkboxes, we can use get()
    const newsletter = formData.get('newsletter') ? true : false;
    
    // For checkbox groups, we need to use getAll()
    const selectedFruits = formData.getAll('fruits');
    
    this.formData = {
      newsletter,
      fruits: selectedFruits
    };
    
    console.log('Form submitted:', this.formData);
  }
  
  isFruitSelected(value) {
    return this.selectedFruits.includes(value);
  }

  <template>
    <div class="demo-container">
      <h3>Checkbox Demo</h3>
      
      <div class="section">
        <h4>Single Checkbox</h4>
        <div class="checkbox-container">
          <label>
            <input 
              type="checkbox" 
              checked={{this.isSubscribed}} 
              {{on "change" this.updateSubscription}}
            >
            Subscribe to newsletter
          </label>
        </div>
        
        <div class="result">
          <p>Subscription status: <strong>{{if this.isSubscribed "Subscribed" "Not subscribed"}}</strong></p>
        </div>
      </div>
      
      <div class="section">
        <h4>Checkbox Group</h4>
        <div class="select-all">
          <label>
            <input 
              type="checkbox" 
              checked={{this.allFruitsSelected}} 
              {{on "change" this.toggleAllFruits}}
            >
            Select All Fruits
          </label>
        </div>
        
        <div class="checkbox-group">
          {{#each this.fruits as |fruit|}}
            <div class="checkbox-container">
              <label>
                <input 
                  type="checkbox" 
                  value={{fruit.value}} 
                  checked={{this.isFruitSelected fruit.value}} 
                  {{on "change" this.updateFruitSelection}}
                >
                {{fruit.name}}
              </label>
            </div>
          {{/each}}
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
        <form {{on "submit" this.handleFormSubmit}}>
          <div class="form-group">
            <label>
              <input type="checkbox" name="newsletter" value="yes">
              Subscribe to newsletter
            </label>
          </div>
          
          <div class="form-group">
            <p>Select your favorite fruits:</p>
            {{#each this.fruits as |fruit|}}
              <div class="checkbox-container">
                <label>
                  <input type="checkbox" name="fruits" value={{fruit.value}}>
                  {{fruit.name}}
                </label>
              </div>
            {{/each}}
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
        <p>This component demonstrates three key concepts with checkboxes:</p>
        
        <ol>
          <li>
            <strong>Controlled Checkbox:</strong> The subscription checkbox uses a tracked property and an event handler to maintain its state:
            <pre>
@tracked isSubscribed = false;

@action
updateSubscription(event) {
  this.isSubscribed = event.target.checked;
}
            </pre>
          </li>
          
          <li>
            <strong>Checkbox Group:</strong> The fruit checkboxes use an array to track multiple selections:
            <pre>
@tracked selectedFruits = [];

@action
updateFruitSelection(event) {
  const { value, checked } = event.target;
  
  if (checked) {
    this.selectedFruits = [...this.selectedFruits, value];
  } else {
    this.selectedFruits = this.selectedFruits.filter(
      fruit => fruit !== value
    );
  }
}
            </pre>
          </li>
          
          <li>
            <strong>FormData API:</strong> The form example uses FormData to collect values:
            <pre>
const formData = new FormData(event.target);

// For single checkboxes
const newsletter = formData.get('newsletter') ? true : false;

// For checkbox groups
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
      
      .checkbox-container {
        margin-bottom: 0.5rem;
      }
      
      .checkbox-group {
        margin: 1rem 0;
        padding-left: 1rem;
      }
      
      .select-all {
        margin-bottom: 0.5rem;
        font-weight: bold;
      }
      
      .result {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .explanation {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      pre {
        background-color: #f1f1f1;
        padding: 0.5rem;
        border-radius: 4px;
        overflow-x: auto;
      }
    </style>
  </template>
}

<template>
  <h2>Checkboxes in Ember</h2>
  <CheckboxDemo />
</template>
