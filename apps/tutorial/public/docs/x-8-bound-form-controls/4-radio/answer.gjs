import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class RadioInputDemo extends Component {
  // Basic radio group
  @tracked basicSelection = 'option2';
  
  basicOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];
  
  // Dynamic radio group
  @tracked colorSelection = 'blue';
  
  colors = [
    { value: 'blue', label: 'Blue', hex: '#3498db' },
    { value: 'green', label: 'Green', hex: '#2ecc71' },
    { value: 'red', label: 'Red', hex: '#e74c3c' },
    { value: 'purple', label: 'Purple', hex: '#9b59b6' },
    { value: 'orange', label: 'Orange', hex: '#f39c12' }
  ];
  
  // Custom styled radio group
  @tracked sizeSelection = 'medium';
  
  sizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'x-large', label: 'Extra Large' }
  ];
  
  // Form radio group
  @tracked formSelection = 'email';
  @tracked formResult = null;
  
  contactMethods = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'mail', label: 'Mail' },
    { value: 'none', label: 'Do not contact' }
  ];
  
  get selectedColorObject() {
    return this.colors.find(color => color.value === this.colorSelection) || this.colors[0];
  }
  
  @action
  updateBasicSelection(event) {
    this.basicSelection = event.target.value;
  }
  
  @action
  updateColorSelection(event) {
    this.colorSelection = event.target.value;
  }
  
  @action
  updateSizeSelection(event) {
    this.sizeSelection = event.target.value;
  }
  
  @action
  updateFormSelection(event) {
    this.formSelection = event.target.value;
  }
  
  @action
  handleSubmit(event) {
    event.preventDefault();
    
    // Get the selected contact method object
    const selectedMethod = this.contactMethods.find(method => method.value === this.formSelection);
    
    // Create a result object
    this.formResult = {
      method: selectedMethod.label,
      timestamp: new Date().toLocaleString()
    };
  }

  <template>
    <div class="demo-container">
      <h3>Radio Input Demo</h3>
      
      <div class="section">
        <h4>Basic Radio Group</h4>
        
        <div class="radio-group">
          {{#each this.basicOptions as |option|}}
            <label>
              <input 
                type="radio" 
                name="basic-options" 
                value={{option.value}} 
                checked={{eq this.basicSelection option.value}} 
                {{on "change" this.updateBasicSelection}}
              >
              {{option.label}}
            </label>
          {{/each}}
          
          <div class="selection-display">
            Selected: <span class="value">{{this.basicSelection}}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Dynamic Radio Group</h4>
        
        <div class="radio-group color-radio-group">
          {{#each this.colors as |color|}}
            <label class="color-option">
              <input 
                type="radio" 
                name="color-options" 
                value={{color.value}} 
                checked={{eq this.colorSelection color.value}} 
                {{on "change" this.updateColorSelection}}
              >
              <span class="color-swatch" style="background-color: {{color.hex}};"></span>
              {{color.label}}
            </label>
          {{/each}}
          
          <div class="selection-display">
            Selected: 
            <span class="color-preview" style="background-color: {{this.selectedColorObject.hex}};"></span>
            <span class="value">{{this.selectedColorObject.label}}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Custom Styled Radio Group</h4>
        
        <div class="radio-group custom-radio-group">
          {{#each this.sizes as |size|}}
            <label class="custom-radio-option">
              <input 
                type="radio" 
                name="size-options" 
                value={{size.value}} 
                checked={{eq this.sizeSelection size.value}} 
                {{on "change" this.updateSizeSelection}}
                class="visually-hidden"
              >
              <span class="custom-radio"></span>
              {{size.label}}
            </label>
          {{/each}}
          
          <div class="selection-display">
            Selected: <span class="value">{{this.sizeSelection}}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Radio Form Example</h4>
        
        <form {{on "submit" this.handleSubmit}}>
          <fieldset>
            <legend>Preferred Contact Method</legend>
            
            {{#each this.contactMethods as |method|}}
              <label class="form-radio-option">
                <input 
                  type="radio" 
                  name="contact-method" 
                  value={{method.value}} 
                  checked={{eq this.formSelection method.value}} 
                  {{on "change" this.updateFormSelection}}
                >
                {{method.label}}
              </label>
            {{/each}}
          </fieldset>
          
          <button type="submit">Submit</button>
        </form>
        
        <div class="result">
          {{#if this.formResult}}
            <div class="result-item">
              <strong>Contact Method:</strong> {{this.formResult.method}}
            </div>
            <div class="result-item">
              <strong>Submitted:</strong> {{this.formResult.timestamp}}
            </div>
          {{else}}
            <p class="empty-result">Form submission result will appear here</p>
          {{/if}}
        </div>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates four key concepts with radio inputs:</p>
        
        <ol>
          <li>
            <strong>Controlled Radio Group:</strong> The radio group's value is controlled by a tracked property:
            <pre>
@tracked basicSelection = 'option2';

@action
updateBasicSelection(event) {
  this.basicSelection = event.target.value;
}
            </pre>
          </li>
          
          <li>
            <strong>Dynamic Radio Options:</strong> Radio options are generated from an array of data:
            <pre>
colors = [
  { value: 'blue', label: 'Blue', hex: '#3498db' },
  { value: 'green', label: 'Green', hex: '#2ecc71' },
  // ...
];

// In the template:
{{#each this.colors as |color|}}
  <label>
    <input 
      type="radio" 
      name="color-options" 
      value={{color.value}} 
      checked={{eq this.colorSelection color.value}} 
      {{on "change" this.updateColorSelection}}
    >
    {{color.label}}
  </label>
{{/each}}
            </pre>
          </li>
          
          <li>
            <strong>Custom Styled Radio Inputs:</strong> Radio inputs can be styled with CSS:
            <pre>
<label class="custom-radio-option">
  <input 
    type="radio" 
    name="size-options" 
    value={{size.value}} 
    checked={{eq this.sizeSelection size.value}} 
    {{on "change" this.updateSizeSelection}}
    class="visually-hidden"
  >
  <span class="custom-radio"></span>
  {{size.label}}
</label>
            </pre>
          </li>
          
          <li>
            <strong>Form Submission:</strong> Radio values can be collected and processed on form submission:
            <pre>
@action
handleSubmit(event) {
  event.preventDefault();
  
  // Get the selected contact method object
  const selectedMethod = this.contactMethods.find(
    method => method.value === this.formSelection
  );
  
  // Create a result object
  this.formResult = {
    method: selectedMethod.label,
    timestamp: new Date().toLocaleString()
  };
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
      
      .radio-group {
        margin-bottom: 1rem;
      }
      
      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
      }
      
      /* Color radio group styles */
      .color-radio-group .color-option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .color-swatch {
        display: inline-block;
        width: 1.5rem;
        height: 1.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .color-preview {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 1px solid #ccc;
        border-radius: 2px;
        margin-right: 0.5rem;
        vertical-align: middle;
      }
      
      /* Custom radio styles */
      .custom-radio-group .custom-radio-option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      
      .custom-radio-group .custom-radio-option:hover {
        background-color: #f8f9fa;
      }
      
      .custom-radio {
        position: relative;
        display: inline-block;
        width: 1.25rem;
        height: 1.25rem;
        border: 2px solid #ccc;
        border-radius: 50%;
        transition: border-color 0.2s;
      }
      
      .custom-radio::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 50%;
        background-color: #3498db;
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      input[type="radio"]:checked + .custom-radio {
        border-color: #3498db;
      }
      
      input[type="radio"]:checked + .custom-radio::after {
        opacity: 1;
      }
      
      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      /* Form styles */
      fieldset {
        margin: 0;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-bottom: 1rem;
      }
      
      legend {
        padding: 0 0.5rem;
        font-weight: bold;
      }
      
      .form-radio-option {
        display: block;
        margin-bottom: 0.5rem;
      }
      
      .selection-display {
        margin-top: 1rem;
        font-size: 0.875rem;
        color: #666;
      }
      
      .value {
        font-weight: bold;
        color: #333;
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
      
      .result-item {
        margin-bottom: 0.5rem;
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
  <h2>Radio Inputs in Ember</h2>
  <RadioInputDemo />
</template>
