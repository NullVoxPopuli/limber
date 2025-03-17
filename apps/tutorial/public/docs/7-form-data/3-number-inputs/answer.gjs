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
  
  @action
  updateValue(event) {
    // Get the value from the input and convert it to a number
    const inputValue = event.target.value;
    const numericValue = parseInt(inputValue, 10);
    
    // Validate the value
    if (isNaN(numericValue)) {
      this.error = 'Please enter a valid number';
      return;
    }
    
    if (numericValue < this.minValue) {
      this.error = `Value cannot be less than ${this.minValue}`;
      this.value = this.minValue;
      return;
    }
    
    if (numericValue > this.maxValue) {
      this.error = `Value cannot be greater than ${this.maxValue}`;
      this.value = this.maxValue;
      return;
    }
    
    // If we get here, the value is valid
    this.error = null;
    this.value = numericValue;
  }

  <template>
    <div class="demo-container">
      <h3>Number Input Demo</h3>
      
      <div class="input-container">
        <label for="quantity">Quantity ({{this.minValue}}-{{this.maxValue}}):</label>
        
        <input 
          type="number" 
          id="quantity"
          value={{this.value}}
          min={{this.minValue}}
          max={{this.maxValue}}
          step="1"
          {{on "input" this.updateValue}}
        />
      </div>
      
      {{#if this.error}}
        <div class="error-message">{{this.error}}</div>
      {{/if}}
      
      <div class="value-display">
        <p>Current value: <strong>{{this.value}}</strong></p>
        <p>Value type: <strong>{{typeof this.value}}</strong></p>
      </div>
      
      <div class="form-example">
        <h4>FormData Example</h4>
        <form {{on "submit" this.handleSubmit}}>
          <input type="number" name="quantity" value={{this.value}} min={{this.minValue}} max={{this.maxValue}} />
          <button type="submit">Submit</button>
        </form>
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
        margin-bottom: 1rem;
      }
      
      .form-example {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #ccc;
      }
      
      form {
        display: flex;
        gap: 0.5rem;
      }
      
      button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    </style>
  </template>
  
  @action
  handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    console.log('Form data:', data);
    console.log('Quantity type:', typeof data.quantity); // Will be "string"
    console.log('Quantity value:', data.quantity);
    
    // Convert to number if needed
    const numericQuantity = parseInt(data.quantity, 10);
    console.log('Numeric quantity:', numericQuantity);
    console.log('Numeric quantity type:', typeof numericQuantity); // Will be "number"
  }
}

<template>
  <h2>Number Input Example</h2>
  <NumberInputDemo />
</template>
