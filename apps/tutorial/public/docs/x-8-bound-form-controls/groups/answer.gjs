import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class FormGroupsDemo extends Component {
  // Personal information group
  @tracked personalInfo = {
    firstName: '',
    lastName: '',
    email: ''
  };
  
  // Address information group
  @tracked addressInfo = {
    street: '',
    city: '',
    state: '',
    zipCode: ''
  };
  
  // Preferences group
  @tracked preferencesInfo = {
    theme: 'light',
    notifications: false,
    newsletter: false
  };
  
  // Form submission result
  @tracked formResult = null;
  
  // US states for the select dropdown
  states = [
    { value: '', label: 'Select a state' },
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];
  
  // Theme options for the select dropdown
  themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System Default' }
  ];
  
  @action
  updatePersonalInfo(event) {
    const { name, value } = event.target;
    
    this.personalInfo = {
      ...this.personalInfo,
      [name]: value
    };
  }
  
  @action
  updateAddressInfo(event) {
    const { name, value } = event.target;
    
    this.addressInfo = {
      ...this.addressInfo,
      [name]: value
    };
  }
  
  @action
  updatePreferencesTheme(event) {
    const value = event.target.value;
    
    this.preferencesInfo = {
      ...this.preferencesInfo,
      theme: value
    };
  }
  
  @action
  updatePreferencesCheckbox(event) {
    const { name, checked } = event.target;
    
    this.preferencesInfo = {
      ...this.preferencesInfo,
      [name]: checked
    };
  }
  
  @action
  handleSubmit(event) {
    event.preventDefault();
    
    // Create a FormData object from the form
    const formData = new FormData(event.target);
    
    // Convert FormData to a plain object
    const formValues = Object.fromEntries(formData.entries());
    
    // Organize the data into groups
    const result = {
      personal: {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email
      },
      address: {
        street: formValues.street,
        city: formValues.city,
        state: formValues.state,
        zipCode: formValues.zipCode
      },
      preferences: {
        theme: formValues.theme,
        notifications: formValues.notifications === 'on',
        newsletter: formValues.newsletter === 'on'
      },
      timestamp: new Date().toLocaleString()
    };
    
    // Update the result state
    this.formResult = result;
  }

  <template>
    <div class="demo-container">
      <h3>Form Input Groups Demo</h3>
      
      <form {{on "submit" this.handleSubmit}}>
        <fieldset>
          <legend>Personal Information</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName" 
                value={{this.personalInfo.firstName}} 
                {{on "input" this.updatePersonalInfo}}
                required
              >
            </div>
            
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName" 
                value={{this.personalInfo.lastName}} 
                {{on "input" this.updatePersonalInfo}}
                required
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={{this.personalInfo.email}} 
              {{on "input" this.updatePersonalInfo}}
              required
            >
          </div>
        </fieldset>
        
        <fieldset>
          <legend>Address Information</legend>
          
          <div class="form-group">
            <label for="street">Street Address</label>
            <input 
              type="text" 
              id="street" 
              name="street" 
              value={{this.addressInfo.street}} 
              {{on "input" this.updateAddressInfo}}
              required
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="city">City</label>
              <input 
                type="text" 
                id="city" 
                name="city" 
                value={{this.addressInfo.city}} 
                {{on "input" this.updateAddressInfo}}
                required
              >
            </div>
            
            <div class="form-group">
              <label for="state">State</label>
              <select 
                id="state" 
                name="state" 
                value={{this.addressInfo.state}} 
                {{on "change" this.updateAddressInfo}}
                required
              >
                {{#each this.states as |state|}}
                  <option value={{state.value}}>{{state.label}}</option>
                {{/each}}
              </select>
            </div>
            
            <div class="form-group">
              <label for="zipCode">ZIP Code</label>
              <input 
                type="text" 
                id="zipCode" 
                name="zipCode" 
                value={{this.addressInfo.zipCode}} 
                {{on "input" this.updateAddressInfo}}
                required
              >
            </div>
          </div>
        </fieldset>
        
        <fieldset>
          <legend>Preferences</legend>
          
          <div class="form-group">
            <label for="theme">Theme</label>
            <select 
              id="theme" 
              name="theme" 
              value={{this.preferencesInfo.theme}} 
              {{on "change" this.updatePreferencesTheme}}
            >
              {{#each this.themes as |theme|}}
                <option value={{theme.value}}>{{theme.label}}</option>
              {{/each}}
            </select>
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                id="notifications" 
                name="notifications" 
                checked={{this.preferencesInfo.notifications}} 
                {{on "change" this.updatePreferencesCheckbox}}
              >
              Enable Notifications
            </label>
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                id="newsletter" 
                name="newsletter" 
                checked={{this.preferencesInfo.newsletter}} 
                {{on "change" this.updatePreferencesCheckbox}}
              >
              Subscribe to Newsletter
            </label>
          </div>
        </fieldset>
        
        <div class="form-actions">
          <button type="submit">Submit</button>
        </div>
      </form>
      
      <div class="result">
        {{#if this.formResult}}
          <div class="result-section">
            <h4>Personal Information</h4>
            <div class="result-item">
              <div class="result-label">First Name:</div>
              <div>{{this.formResult.personal.firstName}}</div>
            </div>
            <div class="result-item">
              <div class="result-label">Last Name:</div>
              <div>{{this.formResult.personal.lastName}}</div>
            </div>
            <div class="result-item">
              <div class="result-label">Email:</div>
              <div>{{this.formResult.personal.email}}</div>
            </div>
          </div>
          
          <div class="result-section">
            <h4>Address Information</h4>
            <div class="result-item">
              <div class="result-label">Street:</div>
              <div>{{this.formResult.address.street}}</div>
            </div>
            <div class="result-item">
              <div class="result-label">City:</div>
              <div>{{this.formResult.address.city}}</div>
            </div>
            <div class="result-item">
              <div class="result-label">State:</div>
              <div>{{this.formResult.address.state}}</div>
            </div>
            <div class="result-item">
              <div class="result-label">ZIP Code:</div>
              <div>{{this.formResult.address.zipCode}}</div>
            </div>
          </div>
          
          <div class="result-section">
            <h4>Preferences</h4>
            <div class="result-item">
              <div class="result-label">Theme:</div>
              <div>{{this.formResult.preferences.theme}}</div>
            </div>
            <div class="result-item">
              <div class="result-label">Notifications:</div>
              <div>{{if this.formResult.preferences.notifications "Enabled" "Disabled"}}</div>
            </div>
            <div class="result-item">
              <div class="result-label">Newsletter:</div>
              <div>{{if this.formResult.preferences.newsletter "Subscribed" "Not subscribed"}}</div>
            </div>
          </div>
          
          <div class="result-section">
            <div class="result-item">
              <div class="result-label">Submitted:</div>
              <div>{{this.formResult.timestamp}}</div>
            </div>
          </div>
        {{else}}
          <p class="empty-result">Form submission result will appear here</p>
        {{/if}}
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates three key concepts with form input groups:</p>
        
        <ol>
          <li>
            <strong>Semantic Grouping:</strong> Using fieldset and legend elements to group related inputs:
            <pre>
<fieldset>
  <legend>Personal Information</legend>
  <!-- Form inputs for personal information -->
</fieldset>
            </pre>
          </li>
          
          <li>
            <strong>Grouped State Management:</strong> Organizing form state into logical groups:
            <pre>
@tracked personalInfo = {
  firstName: '',
  lastName: '',
  email: ''
};

@action
updatePersonalInfo(event) {
  const { name, value } = event.target;
  
  this.personalInfo = {
    ...this.personalInfo,
    [name]: value
  };
}
            </pre>
          </li>
          
          <li>
            <strong>Organized Form Submission:</strong> Processing form data by group:
            <pre>
@action
handleSubmit(event) {
  event.preventDefault();
  
  // Create a FormData object from the form
  const formData = new FormData(event.target);
  
  // Convert FormData to a plain object
  const formValues = Object.fromEntries(formData.entries());
  
  // Organize the data into groups
  const result = {
    personal: {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email
    },
    // Other groups...
  };
  
  // Update the result state
  this.formResult = result;
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
      
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
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
  <h2>Form Input Groups in Ember</h2>
  <FormGroupsDemo />
</template>
