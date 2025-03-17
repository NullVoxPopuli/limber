import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class SelectInputDemo extends Component {
  // Basic select
  @tracked basicSelection = 'option2';
  
  basicOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' }
  ];
  
  // Dynamic select
  @tracked colorSelection = '#3498db';
  
  colors = [
    { value: '#3498db', label: 'Blue', name: 'Blue' },
    { value: '#2ecc71', label: 'Green', name: 'Green' },
    { value: '#e74c3c', label: 'Red', name: 'Red' },
    { value: '#f39c12', label: 'Orange', name: 'Orange' },
    { value: '#9b59b6', label: 'Purple', name: 'Purple' },
    { value: '#1abc9c', label: 'Turquoise', name: 'Turquoise' },
    { value: '#34495e', label: 'Dark Blue', name: 'Dark Blue' },
    { value: '#e67e22', label: 'Amber', name: 'Amber' }
  ];
  
  // Option groups
  @tracked languageSelection = 'javascript';
  
  languageGroups = [
    {
      label: 'Frontend',
      options: [
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' }
      ]
    },
    {
      label: 'Backend',
      options: [
        { value: 'python', label: 'Python' },
        { value: 'ruby', label: 'Ruby' },
        { value: 'java', label: 'Java' },
        { value: 'csharp', label: 'C#' }
      ]
    },
    {
      label: 'Database',
      options: [
        { value: 'sql', label: 'SQL' },
        { value: 'mongodb', label: 'MongoDB' },
        { value: 'graphql', label: 'GraphQL' }
      ]
    }
  ];
  
  // Cascading selects
  @tracked categorySelection = 'fruits';
  @tracked itemSelection = null;
  
  categories = [
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'dairy', label: 'Dairy Products' },
    { value: 'grains', label: 'Grains' }
  ];
  
  itemsByCategory = {
    fruits: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'orange', label: 'Orange' },
      { value: 'strawberry', label: 'Strawberry' }
    ],
    vegetables: [
      { value: 'carrot', label: 'Carrot' },
      { value: 'broccoli', label: 'Broccoli' },
      { value: 'spinach', label: 'Spinach' },
      { value: 'potato', label: 'Potato' }
    ],
    dairy: [
      { value: 'milk', label: 'Milk' },
      { value: 'cheese', label: 'Cheese' },
      { value: 'yogurt', label: 'Yogurt' },
      { value: 'butter', label: 'Butter' }
    ],
    grains: [
      { value: 'rice', label: 'Rice' },
      { value: 'wheat', label: 'Wheat' },
      { value: 'oats', label: 'Oats' },
      { value: 'barley', label: 'Barley' }
    ]
  };
  
  get currentItems() {
    return this.itemsByCategory[this.categorySelection] || [];
  }
  
  get selectedColorObject() {
    return this.colors.find(color => color.value === this.colorSelection) || this.colors[0];
  }
  
  get selectedLanguageObject() {
    for (const group of this.languageGroups) {
      const found = group.options.find(option => option.value === this.languageSelection);
      if (found) {
        return found;
      }
    }
    return null;
  }
  
  get selectedItemObject() {
    if (!this.itemSelection) {
      return null;
    }
    
    return this.currentItems.find(item => item.value === this.itemSelection);
  }
  
  constructor() {
    super(...arguments);
    // Initialize the item selection with the first item of the default category
    this.itemSelection = this.currentItems[0]?.value || null;
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
  updateLanguageSelection(event) {
    this.languageSelection = event.target.value;
  }
  
  @action
  updateCategorySelection(event) {
    this.categorySelection = event.target.value;
    
    // Reset the item selection to the first item of the new category
    this.itemSelection = this.currentItems[0]?.value || null;
  }
  
  @action
  updateItemSelection(event) {
    this.itemSelection = event.target.value;
  }

  <template>
    <div class="demo-container">
      <h3>Select Input Demo</h3>
      
      <div class="section">
        <h4>Basic Select</h4>
        
        <div class="input-group">
          <label for="basic-select">Choose an option:</label>
          <select 
            id="basic-select" 
            value={{this.basicSelection}} 
            {{on "change" this.updateBasicSelection}}
          >
            {{#each this.basicOptions as |option|}}
              <option value={{option.value}}>{{option.label}}</option>
            {{/each}}
          </select>
          
          <div class="selection-display">
            Selected: <span class="value">{{this.basicSelection}}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Dynamic Select</h4>
        
        <div class="input-group">
          <label for="color-select">Choose a color:</label>
          <select 
            id="color-select" 
            value={{this.colorSelection}} 
            {{on "change" this.updateColorSelection}}
          >
            {{#each this.colors as |color|}}
              <option value={{color.value}} style="background-color: {{color.value}}; color: {{if (eq color.value '#34495e') 'white' 'inherit'}};">
                {{color.label}}
              </option>
            {{/each}}
          </select>
          
          <div class="selection-display">
            Selected: 
            <span class="color-preview" style="background-color: {{this.colorSelection}};"></span>
            <span class="value">{{this.selectedColorObject.name}}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Option Groups</h4>
        
        <div class="input-group">
          <label for="language-select">Choose a programming language:</label>
          <select 
            id="language-select" 
            value={{this.languageSelection}} 
            {{on "change" this.updateLanguageSelection}}
          >
            {{#each this.languageGroups as |group|}}
              <optgroup label={{group.label}}>
                {{#each group.options as |option|}}
                  <option value={{option.value}}>{{option.label}}</option>
                {{/each}}
              </optgroup>
            {{/each}}
          </select>
          
          <div class="selection-display">
            Selected: <span class="value">{{this.selectedLanguageObject.label}}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Cascading Selects</h4>
        
        <div class="input-group">
          <label for="category-select">Choose a category:</label>
          <select 
            id="category-select" 
            value={{this.categorySelection}} 
            {{on "change" this.updateCategorySelection}}
          >
            {{#each this.categories as |category|}}
              <option value={{category.value}}>{{category.label}}</option>
            {{/each}}
          </select>
        </div>
        
        <div class="input-group">
          <label for="item-select">Choose an item:</label>
          <select 
            id="item-select" 
            value={{this.itemSelection}} 
            {{on "change" this.updateItemSelection}}
            disabled={{not this.currentItems.length}}
          >
            {{#if this.currentItems.length}}
              {{#each this.currentItems as |item|}}
                <option value={{item.value}}>{{item.label}}</option>
              {{/each}}
            {{else}}
              <option value="">No items available</option>
            {{/if}}
          </select>
          
          <div class="selection-display">
            Selected: <span class="value">{{if this.selectedItemObject this.selectedItemObject.label "None"}}</span>
          </div>
        </div>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates four key concepts with select inputs:</p>
        
        <ol>
          <li>
            <strong>Controlled Select:</strong> The select's value is controlled by a tracked property:
            <pre>
@tracked basicSelection = 'option2';

@action
updateBasicSelection(event) {
  this.basicSelection = event.target.value;
}
            </pre>
          </li>
          
          <li>
            <strong>Dynamic Options:</strong> Options are generated from an array of data:
            <pre>
colors = [
  { value: '#3498db', label: 'Blue', name: 'Blue' },
  { value: '#2ecc71', label: 'Green', name: 'Green' },
  // ...
];

// In the template:
{{#each this.colors as |color|}}
  <option value={{color.value}}>{{color.label}}</option>
{{/each}}
            </pre>
          </li>
          
          <li>
            <strong>Option Groups:</strong> Options are organized into groups:
            <pre>
languageGroups = [
  {
    label: 'Frontend',
    options: [
      { value: 'html', label: 'HTML' },
      // ...
    ]
  },
  // ...
];

// In the template:
{{#each this.languageGroups as |group|}}
  <optgroup label={{group.label}}>
    {{#each group.options as |option|}}
      <option value={{option.value}}>{{option.label}}</option>
    {{/each}}
  </optgroup>
{{/each}}
            </pre>
          </li>
          
          <li>
            <strong>Cascading Selects:</strong> The options of one select depend on the selection of another:
            <pre>
@tracked categorySelection = 'fruits';
@tracked itemSelection = null;

get currentItems() {
  return this.itemsByCategory[this.categorySelection] || [];
}

@action
updateCategorySelection(event) {
  this.categorySelection = event.target.value;
  
  // Reset the item selection to the first item of the new category
  this.itemSelection = this.currentItems[0]?.value || null;
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
      
      select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: white;
      }
      
      select:disabled {
        background-color: #f1f1f1;
        cursor: not-allowed;
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
  <h2>Select Inputs in Ember</h2>
  <SelectInputDemo />
</template>
