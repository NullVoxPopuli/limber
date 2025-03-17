import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

class FormChangeEvents extends Component {
  // Create cells to store form data for different event types
  inputData = cell({});
  changeData = cell({});
  submitData = cell({});
  
  // TODO: Implement event handlers for input, change, submit, and focusout events
  
  <template>
    <div class="demo-container">
      <h3>Form Change Events Demo</h3>
      
      <form class="form-container">
        {{! TODO: Add event handlers for input, change, submit, and focusout events }}
        
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" name="firstName" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" name="lastName" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" class="form-control">
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" name="subscribe" value="yes">
            Subscribe to newsletter
          </label>
        </div>
        
        <button type="submit" class="submit-button">Submit</button>
      </form>
      
      <div class="data-display">
        <div class="data-section">
          <h4>Input Event Data</h4>
          <pre>{{JSON.stringify(this.inputData.current, null, 2)}}</pre>
        </div>
        
        <div class="data-section">
          <h4>Change Event Data</h4>
          <pre>{{JSON.stringify(this.changeData.current, null, 2)}}</pre>
        </div>
        
        <div class="data-section">
          <h4>Submit Event Data</h4>
          <pre>{{JSON.stringify(this.submitData.current, null, 2)}}</pre>
        </div>
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 800px;
      }
      
      .form-container {
        margin-bottom: 2rem;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      
      .form-control {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .submit-button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .data-display {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }
      
      .data-section {
        flex: 1;
        min-width: 200px;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      pre {
        margin: 0;
        white-space: pre-wrap;
      }
    </style>
  </template>
}

<template>
  <h2>Form Change Events</h2>
  <FormChangeEvents />
</template>
