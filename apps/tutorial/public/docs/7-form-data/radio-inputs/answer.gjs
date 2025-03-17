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
  
  @action
  updateSelectedColor(event) {
    const colorId = event.target.value;
    this.selectedColor = this.colors.find(color => color.id === colorId);
  }
  
  @action
  handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Find the color object that matches the selected color
    if (data.favoriteColor) {
      data.colorObject = this.colors.find(color => color.id === data.favoriteColor);
    }
    
    this.formData = data;
    console.log('Form submitted:', this.formData);
  }

  <template>
    <div class="demo-container">
      <h3>Radio Input Demo</h3>
      
      <div class="section">
        <h4>Controlled Radio Group</h4>
        
        <fieldset class="radio-group">
          <legend>Select your favorite color:</legend>
          
          {{#each this.colors as |color|}}
            <div class="radio-option">
              <input 
                type="radio" 
                id="controlled-{{color.id}}" 
                name="controlled-color" 
                value={{color.id}} 
                checked={{eq this.selectedColor.id color.id}} 
                {{on "change" this.updateSelectedColor}}
              >
              <label for="controlled-{{color.id}}">
                <span class="color-preview" style="background-color: {{color.hex}}"></span>
                {{color.name}}
              </label>
            </div>
          {{/each}}
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
        
        <form {{on "submit" this.handleFormSubmit}}>
          <fieldset class="radio-group">
            <legend>Select your favorite color:</legend>
            
            {{#each this.colors as |color|}}
              <div class="radio-option">
                <input 
                  type="radio" 
                  id="form-{{color.id}}" 
                  name="favoriteColor" 
                  value={{color.id}}
                >
                <label for="form-{{color.id}}">
                  <span class="color-preview" style="background-color: {{color.hex}}"></span>
                  {{color.name}}
                </label>
              </div>
            {{/each}}
          </fieldset>
          
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
        <p>This component demonstrates two key concepts with radio inputs:</p>
        
        <ol>
          <li>
            <strong>Controlled Radio Group:</strong> The color selection uses a tracked property and an event handler to maintain its state:
            <pre>
@tracked selectedColor = null;

@action
updateSelectedColor(event) {
  const colorId = event.target.value;
  this.selectedColor = this.colors.find(
    color => color.id === colorId
  );
}
            </pre>
          </li>
          
          <li>
            <strong>FormData API:</strong> The form example uses FormData to collect the selected value:
            <pre>
const formData = new FormData(event.target);
const data = Object.fromEntries(formData.entries());

// data.favoriteColor will be the value of the selected radio
console.log(data.favoriteColor); // "red", "blue", etc.
            </pre>
          </li>
        </ol>
        
        <p>Radio inputs with the same <code>name</code> attribute form a group where only one can be selected at a time. This makes them perfect for mutually exclusive choices.</p>
        
        <p>For accessibility, we've used:</p>
        <ul>
          <li>A <code>fieldset</code> with a <code>legend</code> to group related radio inputs</li>
          <li>Proper <code>label</code> elements associated with each input</li>
          <li>Unique <code>id</code> attributes for each input</li>
        </ul>
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
        background-color: #f1f1f1;
        padding: 0.5rem;
        border-radius: 4px;
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
  <h2>Radio Inputs in Ember</h2>
  <RadioInputDemo />
</template>
