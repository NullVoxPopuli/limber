import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class NumberInputDemo extends Component {
  // Basic number input
  @tracked basicValue = 0;
  
  // Validated number input
  @tracked validatedValue = 50;
  @tracked validationError = null;
  
  // Slider and synchronized input
  @tracked sliderValue = 50;
  
  // Calculator
  @tracked firstNumber = 10;
  @tracked secondNumber = 5;
  @tracked operation = 'add';
  @tracked calculationResult = null;
  
  get isValidatedValueValid() {
    return this.validationError === null;
  }
  
  get calculatorOperations() {
    return [
      { id: 'add', label: '+', title: 'Add' },
      { id: 'subtract', label: '-', title: 'Subtract' },
      { id: 'multiply', label: '×', title: 'Multiply' },
      { id: 'divide', label: '÷', title: 'Divide' }
    ];
  }
  
  @action
  updateBasicValue(event) {
    const value = event.target.value;
    
    // Handle empty input
    if (value === '') {
      this.basicValue = null;
    } else {
      this.basicValue = Number(value);
    }
  }
  
  @action
  updateValidatedValue(event) {
    const value = event.target.value;
    
    // Handle empty input
    if (value === '') {
      this.validatedValue = null;
      this.validationError = 'Value is required';
      return;
    }
    
    const numericValue = Number(value);
    
    // Validate the input
    if (isNaN(numericValue)) {
      this.validationError = 'Please enter a valid number';
    } else if (numericValue < 0) {
      this.validationError = 'Value cannot be negative';
    } else if (numericValue > 100) {
      this.validationError = 'Value cannot exceed 100';
    } else {
      this.validatedValue = numericValue;
      this.validationError = null;
    }
  }
  
  @action
  updateSliderValue(event) {
    this.sliderValue = Number(event.target.value);
  }
  
  @action
  updateSliderInput(event) {
    const value = event.target.value;
    
    // Handle empty input
    if (value === '') {
      return;
    }
    
    const numericValue = Number(value);
    
    // Ensure the value is within the slider range
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
      this.sliderValue = numericValue;
    }
  }
  
  @action
  updateFirstNumber(event) {
    const value = event.target.value;
    
    // Handle empty input
    if (value === '') {
      this.firstNumber = null;
    } else {
      this.firstNumber = Number(value);
    }
  }
  
  @action
  updateSecondNumber(event) {
    const value = event.target.value;
    
    // Handle empty input
    if (value === '') {
      this.secondNumber = null;
    } else {
      this.secondNumber = Number(value);
    }
  }
  
  @action
  updateOperation(event) {
    this.operation = event.target.value;
  }
  
  @action
  calculate() {
    // Ensure both numbers are valid
    if (this.firstNumber === null || this.secondNumber === null) {
      this.calculationResult = 'Please enter valid numbers';
      return;
    }
    
    let result;
    
    switch (this.operation) {
      case 'add':
        result = this.firstNumber + this.secondNumber;
        break;
      case 'subtract':
        result = this.firstNumber - this.secondNumber;
        break;
      case 'multiply':
        result = this.firstNumber * this.secondNumber;
        break;
      case 'divide':
        if (this.secondNumber === 0) {
          this.calculationResult = 'Cannot divide by zero';
          return;
        }
        result = this.firstNumber / this.secondNumber;
        break;
      default:
        this.calculationResult = 'Invalid operation';
        return;
    }
    
    // Format the result to avoid excessive decimal places
    if (Number.isInteger(result)) {
      this.calculationResult = result;
    } else {
      this.calculationResult = result.toFixed(2);
    }
  }

  <template>
    <div class="demo-container">
      <h3>Number Input Demo</h3>
      
      <div class="section">
        <h4>Basic Number Input</h4>
        
        <div class="input-group">
          <label for="basic-number">Enter a number:</label>
          <input 
            type="number" 
            id="basic-number" 
            value={{this.basicValue}} 
            {{on "input" this.updateBasicValue}}
            placeholder="Enter a number"
          >
          
          <div class="value-display">
            Current value: <span class="value">{{if this.basicValue this.basicValue "No value"}}</span>
            <span class="value-type">({{typeof this.basicValue}})</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Number Input with Validation</h4>
        
        <div class="input-group">
          <label for="validated-number">Enter a number (0-100):</label>
          <input 
            type="number" 
            id="validated-number" 
            value={{this.validatedValue}} 
            min="0" 
            max="100"
            class={{if this.validationError "invalid"}}
            {{on "input" this.updateValidatedValue}}
            placeholder="Enter a number between 0 and 100"
          >
          
          {{#if this.validationError}}
            <div class="validation-message error">
              {{this.validationError}}
            </div>
          {{else if this.validatedValue}}
            <div class="validation-message success">
              Value is valid
            </div>
          {{/if}}
          
          <div class="value-display">
            Current value: <span class="value">{{if this.validatedValue this.validatedValue "No value"}}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Numeric Slider</h4>
        
        <div class="slider-container">
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="1" 
            value={{this.sliderValue}} 
            {{on "input" this.updateSliderValue}}
          >
          
          <div class="slider-value">
            {{this.sliderValue}}
          </div>
        </div>
        
        <div class="input-group">
          <label for="slider-number">Fine-tune the value:</label>
          <input 
            type="number" 
            id="slider-number" 
            min="0" 
            max="100" 
            value={{this.sliderValue}} 
            {{on "input" this.updateSliderInput}}
          >
        </div>
      </div>
      
      <div class="section">
        <h4>Simple Calculator</h4>
        
        <div class="calculator">
          <div class="input-row">
            <div class="input-group">
              <label for="calc-num1">First number:</label>
              <input 
                type="number" 
                id="calc-num1" 
                value={{this.firstNumber}} 
                {{on "input" this.updateFirstNumber}}
              >
            </div>
            
            <div class="operation-selector">
              <label for="operation">Operation:</label>
              <select 
                id="operation" 
                value={{this.operation}} 
                {{on "change" this.updateOperation}}
              >
                {{#each this.calculatorOperations as |op|}}
                  <option value={{op.id}} title={{op.title}}>{{op.label}}</option>
                {{/each}}
              </select>
            </div>
            
            <div class="input-group">
              <label for="calc-num2">Second number:</label>
              <input 
                type="number" 
                id="calc-num2" 
                value={{this.secondNumber}} 
                {{on "input" this.updateSecondNumber}}
              >
            </div>
          </div>
          
          <button 
            type="button" 
            class="calculate-button" 
            {{on "click" this.calculate}}
          >
            Calculate
          </button>
          
          <div class="result">
            {{#if this.calculationResult}}
              <div class="result-value">
                {{this.firstNumber}} 
                {{(get (find-by "id" this.operation this.calculatorOperations) "label")}} 
                {{this.secondNumber}} = {{this.calculationResult}}
              </div>
            {{else}}
              <p class="empty-result">Result will appear here</p>
            {{/if}}
          </div>
        </div>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates three key concepts with number inputs:</p>
        
        <ol>
          <li>
            <strong>Type Conversion:</strong> Converting between string values from inputs and numeric values:
            <pre>
@action
updateBasicValue(event) {
  const value = event.target.value;
  
  // Handle empty input
  if (value === '') {
    this.basicValue = null;
  } else {
    this.basicValue = Number(value);
  }
}
            </pre>
          </li>
          
          <li>
            <strong>Validation:</strong> Ensuring numeric values are within expected ranges:
            <pre>
@action
updateValidatedValue(event) {
  const value = event.target.value;
  const numericValue = Number(value);
  
  if (isNaN(numericValue)) {
    this.validationError = 'Please enter a valid number';
  } else if (numericValue < 0) {
    this.validationError = 'Value cannot be negative';
  } else if (numericValue > 100) {
    this.validationError = 'Value cannot exceed 100';
  } else {
    this.validatedValue = numericValue;
    this.validationError = null;
  }
}
            </pre>
          </li>
          
          <li>
            <strong>Synchronized Inputs:</strong> Keeping multiple inputs in sync:
            <pre>
@action
updateSliderValue(event) {
  this.sliderValue = Number(event.target.value);
}

@action
updateSliderInput(event) {
  const numericValue = Number(event.target.value);
  
  // Ensure the value is within the slider range
  if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
    this.sliderValue = numericValue;
  }
}
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
      
      .value-type {
        font-style: italic;
        color: #999;
        margin-left: 0.25rem;
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
        background-color: #3498db;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
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
      
      select {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1.25rem;
      }
      
      .calculate-button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;
      }
      
      .result {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #eee;
        border-radius: 4px;
        text-align: center;
        min-height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .result-value {
        font-size: 1.25rem;
        font-weight: bold;
      }
      
      .empty-result {
        color: #999;
        font-style: italic;
        margin: 0;
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
        font-size: 0.875rem;
      }
    </style>
  </template>
}

<template>
  <h2>Number Inputs in Ember</h2>
  <NumberInputDemo />
</template>
