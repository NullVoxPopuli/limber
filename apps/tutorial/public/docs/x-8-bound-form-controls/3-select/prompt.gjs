import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class SelectInputDemo extends Component {
  // TODO: Add tracked properties for selected values
  
  // TODO: Define options for the basic select
  
  // TODO: Define options for the dynamic select
  
  // TODO: Define option groups
  
  // TODO: Define options for cascading selects
  
  // TODO: Implement update handlers
  
  <template>
    <div class="demo-container">
      <h3>Select Input Demo</h3>
      
      <div class="section">
        <h4>Basic Select</h4>
        
        <div class="input-group">
          <label for="basic-select">Choose an option:</label>
          {{! TODO: Add a controlled select input }}
          
          <div class="selection-display">
            Selected: <span class="value">{{! TODO: Display the selected value }}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Dynamic Select</h4>
        
        <div class="input-group">
          <label for="dynamic-select">Choose a color:</label>
          {{! TODO: Add a select with dynamically generated options }}
          
          <div class="selection-display">
            Selected: 
            <span class="color-preview" style="{{! TODO: Add dynamic background color }}"></span>
            <span class="value">{{! TODO: Display the selected color name }}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Option Groups</h4>
        
        <div class="input-group">
          <label for="grouped-select">Choose a programming language:</label>
          {{! TODO: Add a select with option groups }}
          
          <div class="selection-display">
            Selected: <span class="value">{{! TODO: Display the selected language }}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Cascading Selects</h4>
        
        <div class="input-group">
          <label for="category-select">Choose a category:</label>
          {{! TODO: Add a select for categories }}
        </div>
        
        <div class="input-group">
          <label for="item-select">Choose an item:</label>
          {{! TODO: Add a select for items that depends on the selected category }}
          
          <div class="selection-display">
            Selected: <span class="value">{{! TODO: Display the selected item }}</span>
          </div>
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
      
      .input-group {
        margin-bottom: 1rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      
      select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: white;
      }
      
      .selection-display {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: #666;
      }
      
      .value {
        font-weight: bold;
        color: #333;
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
    </style>
  </template>
}

<template>
  <h2>Select Inputs in Ember</h2>
  <SelectInputDemo />
</template>
