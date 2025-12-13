import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class CheckboxDemo extends Component {
  @tracked isSubscribed = false;
  @tracked selectedFruits = [];
  @tracked allFruitsSelected = false;
  
  fruits = [
    { id: 1, name: 'Apple', value: 'apple' },
    { id: 2, name: 'Banana', value: 'banana' },
    { id: 3, name: 'Orange', value: 'orange' },
    { id: 4, name: 'Strawberry', value: 'strawberry' },
    { id: 5, name: 'Pineapple', value: 'pineapple' }
  ];
  
  // TODO: Implement the update handler for the single checkbox
  
  // TODO: Implement the update handler for the checkbox group
  
  // TODO: Implement the "Select All" functionality
  
  <template>
    <div class="demo-container">
      <h3>Checkbox Demo</h3>
      
      <div class="section">
        <h4>Single Checkbox</h4>
        <div class="checkbox-container">
          <label>
            {{! TODO: Add a controlled checkbox for subscription }}
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
            {{! TODO: Add a "Select All" checkbox }}
            Select All Fruits
          </label>
        </div>
        
        <div class="checkbox-group">
          {{#each this.fruits as |fruit|}}
            <div class="checkbox-container">
              <label>
                {{! TODO: Add checkboxes for each fruit }}
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
        <form>
          {{! TODO: Add a form with checkboxes that uses FormData }}
          <button type="submit">Submit</button>
        </form>
        
        <div class="result">
          <p>Form data will appear here after submission</p>
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
}

<template>
  <h2>Checkboxes in Ember</h2>
  <CheckboxDemo />
</template>
