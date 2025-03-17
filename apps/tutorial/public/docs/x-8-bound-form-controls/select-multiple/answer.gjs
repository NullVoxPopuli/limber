import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class MultiSelectDemo extends Component {
  // Basic multiple select
  @tracked basicSelectedOptions = ['option2', 'option4'];
  
  basicOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
    { value: 'option5', label: 'Option 5' }
  ];
  
  // Styled multiple select
  @tracked styledSelectedItems = ['apple', 'banana', 'grape'];
  
  styledItems = [
    { value: 'apple', label: 'Apple', color: '#e74c3c' },
    { value: 'banana', label: 'Banana', color: '#f1c40f' },
    { value: 'orange', label: 'Orange', color: '#e67e22' },
    { value: 'grape', label: 'Grape', color: '#9b59b6' },
    { value: 'kiwi', label: 'Kiwi', color: '#2ecc71' },
    { value: 'blueberry', label: 'Blueberry', color: '#3498db' },
    { value: 'strawberry', label: 'Strawberry', color: '#e84393' },
    { value: 'pineapple', label: 'Pineapple', color: '#f39c12' }
  ];
  
  // Form multiple select
  @tracked formSelectedSkills = [];
  @tracked formResult = null;
  
  skillOptions = [
    { value: 'html', label: 'HTML', category: 'Frontend' },
    { value: 'css', label: 'CSS', category: 'Frontend' },
    { value: 'javascript', label: 'JavaScript', category: 'Frontend' },
    { value: 'react', label: 'React', category: 'Frontend' },
    { value: 'ember', label: 'Ember.js', category: 'Frontend' },
    { value: 'vue', label: 'Vue.js', category: 'Frontend' },
    { value: 'node', label: 'Node.js', category: 'Backend' },
    { value: 'express', label: 'Express', category: 'Backend' },
    { value: 'python', label: 'Python', category: 'Backend' },
    { value: 'django', label: 'Django', category: 'Backend' },
    { value: 'ruby', label: 'Ruby', category: 'Backend' },
    { value: 'rails', label: 'Ruby on Rails', category: 'Backend' },
    { value: 'sql', label: 'SQL', category: 'Database' },
    { value: 'mongodb', label: 'MongoDB', category: 'Database' },
    { value: 'postgres', label: 'PostgreSQL', category: 'Database' },
    { value: 'redis', label: 'Redis', category: 'Database' }
  ];
  
  get skillCategories() {
    const categories = {};
    
    this.skillOptions.forEach(skill => {
      if (!categories[skill.category]) {
        categories[skill.category] = [];
      }
      
      categories[skill.category].push(skill);
    });
    
    return Object.entries(categories).map(([name, skills]) => ({
      name,
      skills
    }));
  }
  
  get selectedBasicOptionLabels() {
    return this.basicSelectedOptions.map(value => {
      const option = this.basicOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    });
  }
  
  get selectedStyledItems() {
    return this.styledSelectedItems.map(value => {
      return this.styledItems.find(item => item.value === value);
    }).filter(Boolean);
  }
  
  get selectedSkillLabels() {
    return this.formSelectedSkills.map(value => {
      const skill = this.skillOptions.find(opt => opt.value === value);
      return skill ? skill.label : value;
    });
  }
  
  @action
  updateBasicSelection(event) {
    // Convert the HTMLCollection to an array of values
    this.basicSelectedOptions = Array.from(event.target.selectedOptions).map(option => option.value);
  }
  
  @action
  updateStyledSelection(event) {
    // Convert the HTMLCollection to an array of values
    this.styledSelectedItems = Array.from(event.target.selectedOptions).map(option => option.value);
  }
  
  @action
  updateFormSelection(event) {
    // Convert the HTMLCollection to an array of values
    this.formSelectedSkills = Array.from(event.target.selectedOptions).map(option => option.value);
  }
  
  @action
  handleSubmit(event) {
    event.preventDefault();
    
    // Create a FormData object from the form
    const formData = new FormData(event.target);
    
    // Use getAll() to retrieve all selected values
    const selectedSkills = formData.getAll('skills');
    
    // Get the skill labels for display
    const skillLabels = selectedSkills.map(value => {
      const skill = this.skillOptions.find(opt => opt.value === value);
      return skill ? skill.label : value;
    });
    
    // Create a result object
    this.formResult = {
      skills: skillLabels,
      count: selectedSkills.length,
      timestamp: new Date().toLocaleString()
    };
  }

  <template>
    <div class="demo-container">
      <h3>Multiple Select Demo</h3>
      
      <div class="section">
        <h4>Basic Multiple Select</h4>
        
        <div class="input-group">
          <label for="basic-multiselect">Select multiple options:</label>
          <select 
            id="basic-multiselect" 
            multiple 
            {{on "change" this.updateBasicSelection}}
          >
            {{#each this.basicOptions as |option|}}
              <option 
                value={{option.value}} 
                selected={{includes option.value this.basicSelectedOptions}}
              >
                {{option.label}}
              </option>
            {{/each}}
          </select>
          <p class="hint">Hold Ctrl (or Cmd on Mac) to select multiple options</p>
          
          <div class="selection-display">
            <h5>Selected Options:</h5>
            <div class="selected-options">
              {{#if this.basicSelectedOptions.length}}
                {{#each this.selectedBasicOptionLabels as |label|}}
                  <span class="selected-option">{{label}}</span>
                {{/each}}
              {{else}}
                <p class="empty-selection">No options selected</p>
              {{/if}}
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Styled Multiple Select</h4>
        
        <div class="input-group">
          <label for="styled-multiselect">Select multiple fruits:</label>
          <select 
            id="styled-multiselect" 
            class="styled-multiselect" 
            multiple 
            {{on "change" this.updateStyledSelection}}
          >
            {{#each this.styledItems as |item|}}
              <option 
                value={{item.value}} 
                selected={{includes item.value this.styledSelectedItems}}
                class="styled-option"
                data-color={{item.color}}
              >
                {{item.label}}
              </option>
            {{/each}}
          </select>
          
          <div class="selection-display">
            <h5>Selected Fruits:</h5>
            <div class="selected-options">
              {{#if this.styledSelectedItems.length}}
                {{#each this.selectedStyledItems as |item|}}
                  <span class="selected-option" style="background-color: {{item.color}}20; border-color: {{item.color}};">
                    {{item.label}}
                  </span>
                {{/each}}
              {{else}}
                <p class="empty-selection">No fruits selected</p>
              {{/if}}
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Form with Multiple Select</h4>
        
        <form {{on "submit" this.handleSubmit}}>
          <div class="input-group">
            <label for="form-multiselect">Select your skills:</label>
            <select 
              id="form-multiselect" 
              name="skills" 
              class="form-multiselect" 
              multiple 
              {{on "change" this.updateFormSelection}}
            >
              {{#each this.skillCategories as |category|}}
                <optgroup label={{category.name}}>
                  {{#each category.skills as |skill|}}
                    <option 
                      value={{skill.value}} 
                      selected={{includes skill.value this.formSelectedSkills}}
                    >
                      {{skill.label}}
                    </option>
                  {{/each}}
                </optgroup>
              {{/each}}
            </select>
          </div>
          
          <button type="submit">Submit</button>
        </form>
        
        <div class="result">
          {{#if this.formResult}}
            <div class="result-header">
              <strong>Selected Skills ({{this.formResult.count}}):</strong>
            </div>
            <div class="result-skills">
              {{#each this.formResult.skills as |skill|}}
                <span class="result-skill">{{skill}}</span>
              {{/each}}
            </div>
            <div class="result-timestamp">
              Submitted: {{this.formResult.timestamp}}
            </div>
          {{else}}
            <p class="empty-result">Form submission result will appear here</p>
          {{/if}}
        </div>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates three key concepts with multiple select inputs:</p>
        
        <ol>
          <li>
            <strong>Controlled Multiple Select:</strong> The select's values are controlled by a tracked property:
            <pre>
@tracked basicSelectedOptions = ['option2', 'option4'];

@action
updateBasicSelection(event) {
  // Convert the HTMLCollection to an array of values
  this.basicSelectedOptions = Array.from(event.target.selectedOptions)
    .map(option => option.value);
}
            </pre>
          </li>
          
          <li>
            <strong>Setting Selected Options:</strong> Options are marked as selected using the selected attribute:
            <pre>
<option 
  value={{option.value}} 
  selected={{includes option.value this.basicSelectedOptions}}
>
  {{option.label}}
</option>
            </pre>
          </li>
          
          <li>
            <strong>FormData with Multiple Select:</strong> Using getAll() to retrieve all selected values:
            <pre>
@action
handleSubmit(event) {
  event.preventDefault();
  
  // Create a FormData object from the form
  const formData = new FormData(event.target);
  
  // Use getAll() to retrieve all selected values
  const selectedSkills = formData.getAll('skills');
  
  // Process the selected values...
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
      }
      
      select[multiple] {
        min-height: 150px;
      }
      
      /* Styled multiselect */
      .styled-multiselect {
        padding: 0;
        overflow: hidden;
      }
      
      .styled-multiselect option {
        padding: 0.75rem 0.5rem;
        margin-bottom: 0.25rem;
        border-left: 4px solid transparent;
        transition: background-color 0.2s, border-color 0.2s;
      }
      
      .styled-multiselect option:checked {
        background-color: #e1f5fe !important;
        border-left-color: #3498db;
        color: #333;
      }
      
      .styled-multiselect option:hover {
        background-color: #f8f9fa;
      }
      
      /* Form multiselect */
      .form-multiselect {
        border-color: #3498db;
      }
      
      .form-multiselect optgroup {
        font-weight: bold;
        color: #3498db;
        background-color: #f8f9fa;
        padding: 0.5rem;
      }
      
      .form-multiselect option {
        padding: 0.5rem;
        margin-bottom: 0.25rem;
      }
      
      .form-multiselect option:checked {
        background-color: #3498db !important;
        color: white;
      }
      
      .hint {
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: #666;
        font-style: italic;
      }
      
      .selection-display {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .selection-display h5 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      
      .selected-options {
        padding: 0.5rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        min-height: 3rem;
      }
      
      .selected-option {
        display: inline-block;
        margin: 0.25rem;
        padding: 0.25rem 0.5rem;
        background-color: #e1f5fe;
        border: 1px solid #3498db;
        border-radius: 4px;
      }
      
      .empty-selection {
        color: #999;
        font-style: italic;
        margin: 0;
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
      
      .result-header {
        margin-bottom: 0.5rem;
      }
      
      .result-skills {
        margin-bottom: 0.5rem;
      }
      
      .result-skill {
        display: inline-block;
        margin: 0.25rem;
        padding: 0.25rem 0.5rem;
        background-color: #e1f5fe;
        border: 1px solid #3498db;
        border-radius: 4px;
      }
      
      .result-timestamp {
        font-size: 0.875rem;
        color: #666;
        font-style: italic;
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
  <h2>Multiple Select Inputs in Ember</h2>
  <MultiSelectDemo />
</template>
