import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

class FormChangeEvents extends Component {
  // Create cells to store form data for different event types
  inputData = cell({});
  changeData = cell({});
  submitData = cell({});
  focusEvents = cell([]);
  
  // Event handlers for different form events
  handleInput = (event) => {
    let formData = new FormData(event.currentTarget);
    let data = Object.fromEntries(formData.entries());
    
    this.inputData.current = data;
  };
  
  handleChange = (event) => {
    let formData = new FormData(event.currentTarget);
    let data = Object.fromEntries(formData.entries());
    
    this.changeData.current = data;
  };
  
  handleSubmit = (event) => {
    event.preventDefault();
    
    let formData = new FormData(event.currentTarget);
    let data = Object.fromEntries(formData.entries());
    
    this.submitData.current = data;
    console.log('Form submitted:', data);
  };
  
  handleFocusOut = (event) => {
    if (event.target.name) {
      const fieldName = event.target.name;
      const timestamp = new Date().toLocaleTimeString();
      
      this.focusEvents.current = [
        { field: fieldName, time: timestamp },
        ...this.focusEvents.current.slice(0, 4) // Keep only the 5 most recent events
      ];
      
      console.log(`Field '${fieldName}' lost focus at ${timestamp}`);
    }
  };

  <template>
    <div class="demo-container">
      <h3>Form Change Events Demo</h3>
      
      <form 
        class="form-container"
        {{on 'input' this.handleInput}}
        {{on 'change' this.handleChange}}
        {{on 'submit' this.handleSubmit}}
        {{on 'focusout' this.handleFocusOut}}
      >
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
          <p class="event-description">Updates in real-time as you type</p>
          <pre>{{JSON.stringify(this.inputData.current, null, 2)}}</pre>
        </div>
        
        <div class="data-section">
          <h4>Change Event Data</h4>
          <p class="event-description">Updates when focus leaves an input</p>
          <pre>{{JSON.stringify(this.changeData.current, null, 2)}}</pre>
        </div>
        
        <div class="data-section">
          <h4>Submit Event Data</h4>
          <p class="event-description">Updates when the form is submitted</p>
          <pre>{{JSON.stringify(this.submitData.current, null, 2)}}</pre>
        </div>
      </div>
      
      <div class="focus-events">
        <h4>Focus Events Log</h4>
        <p class="event-description">Shows when fields lose focus</p>
        {{#if this.focusEvents.current.length}}
          <ul>
            {{#each this.focusEvents.current as |event|}}
              <li>Field '{{event.field}}' lost focus at {{event.time}}</li>
            {{/each}}
          </ul>
        {{else}}
          <p>No focus events yet. Try clicking in and out of form fields.</p>
        {{/if}}
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates different form events in Ember:</p>
        <ul>
          <li><strong>input</strong>: Fires whenever the value changes (e.g., as you type)</li>
          <li><strong>change</strong>: Fires when the value is committed (e.g., when focus leaves the input)</li>
          <li><strong>submit</strong>: Fires when the form is submitted</li>
          <li><strong>focusout</strong>: Fires when an element loses focus</li>
        </ul>
        <p>The event handlers use FormData to collect all form values:</p>
        <pre>
const handleInput = (event) => {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());
  
  this.inputData.current = data;
};
        </pre>
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
        margin-bottom: 1.5rem;
      }
      
      .data-section {
        flex: 1;
        min-width: 200px;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .event-description {
        font-style: italic;
        color: #666;
        margin-top: 0;
      }
      
      pre {
        margin: 0;
        white-space: pre-wrap;
        background-color: #f1f1f1;
        padding: 0.5rem;
        border-radius: 4px;
      }
      
      .focus-events {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .focus-events ul {
        margin: 0;
        padding-left: 1.5rem;
      }
      
      .explanation {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .explanation pre {
        margin-top: 1rem;
      }
    </style>
  </template>
}

<template>
  <h2>Form Change Events</h2>
  <FormChangeEvents />
</template>
