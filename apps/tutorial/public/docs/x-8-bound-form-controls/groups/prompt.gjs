import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class FormGroupsDemo extends Component {
  // TODO: Add tracked properties for form groups
  
  // TODO: Add update handlers for each group
  
  // TODO: Add form submission handler
  
  <template>
    <div class="demo-container">
      <h3>Form Input Groups Demo</h3>
      
      <form>
        {{! TODO: Add form with grouped inputs }}
        
        <div class="form-actions">
          <button type="submit">Submit</button>
        </div>
      </form>
      
      <div class="result">
        {{! TODO: Display form submission result }}
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 600px;
      }
      
      form {
        margin-bottom: 2rem;
      }
      
      fieldset {
        margin-bottom: 1.5rem;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      legend {
        padding: 0 0.5rem;
        font-weight: bold;
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      
      input[type="text"],
      input[type="email"],
      select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .form-row {
        display: flex;
        gap: 1rem;
      }
      
      .form-row .form-group {
        flex: 1;
      }
      
      .form-actions {
        margin-top: 1.5rem;
        text-align: right;
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
        margin-top: 1.5rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .result-section {
        margin-bottom: 1rem;
      }
      
      .result-section h4 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        border-bottom: 1px solid #ddd;
        padding-bottom: 0.25rem;
      }
      
      .result-item {
        display: flex;
        margin-bottom: 0.25rem;
      }
      
      .result-label {
        font-weight: bold;
        width: 120px;
      }
      
      .empty-result {
        color: #999;
        font-style: italic;
      }
    </style>
  </template>
}

<template>
  <h2>Form Input Groups in Ember</h2>
  <FormGroupsDemo />
</template>
