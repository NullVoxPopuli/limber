import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class FormGroupsDemo extends Component {
  @tracked personalInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };
  
  @tracked addressInfo = {
    street: '',
    city: '',
    state: '',
    zipCode: ''
  };
  
  @tracked preferenceInfo = {
    contactMethod: 'email',
    newsletter: false,
    interests: []
  };
  
  @tracked formSubmission = null;
  
  states = [
    { value: '', label: 'Select a state' },
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    // More states would be added here
    { value: 'WY', label: 'Wyoming' }
  ];
  
  interestOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'education', label: 'Education' }
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
  updatePreferenceInfo(event) {
    const { name, type, value, checked } = event.target;
    
    let newValue;
    
    if (type === 'checkbox') {
      if (name === 'newsletter') {
        newValue = checked;
      } else if (name === 'interests') {
        const interests = [...this.preferenceInfo.interests];
        
        if (checked) {
          if (!interests.includes(value)) {
            interests.push(value);
          }
        } else {
          const index = interests.indexOf(value);
          if (index !== -1) {
            interests.splice(index, 1);
          }
        }
        
        newValue = interests;
      }
    } else {
      newValue = value;
    }
    
    this.preferenceInfo = {
      ...this.preferenceInfo,
      [name]: newValue
    };
  }
  
  @action
  handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const flatData = Object.fromEntries(formData.entries());
    
    // For checkboxes with multiple values (interests), we need to use getAll
    const interests = formData.getAll('interests');
    
    // Organize the flat data into groups
    const organizedData = {
      personalInfo: {
        firstName: flatData.firstName,
        lastName: flatData.lastName,
        email: flatData.email,
        phone: flatData.phone
      },
      addressInfo: {
        street: flatData.street,
        city: flatData.city,
        state: flatData.state,
        zipCode: flatData.zipCode
      },
      preferenceInfo: {
        contactMethod: flatData.contactMethod,
        newsletter: flatData.newsletter ? true : false,
        interests
      }
    };
    
    this.formSubmission = organizedData;
    console.log('Form submitted:', this.formSubmission);
  }
  
  get isInterestSelected() {
    return (interest) => this.preferenceInfo.interests.includes(interest);
  }

  <template>
    <div class="demo-container">
      <h3>Form Groups Demo</h3>
      
      <form {{on "submit" this.handleFormSubmit}}>
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
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={{this.personalInfo.email}} 
                {{on "input" this.updatePersonalInfo}}
              >
            </div>
            
            <div class="form-group">
              <label for="phone">Phone</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={{this.personalInfo.phone}} 
                {{on "input" this.updatePersonalInfo}}
              >
            </div>
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
              >
            </div>
            
            <div class="form-group">
              <label for="state">State</label>
              <select 
                id="state" 
                name="state" 
                value={{this.addressInfo.state}} 
                {{on "change" this.updateAddressInfo}}
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
              >
            </div>
          </div>
        </fieldset>
        
        <fieldset>
          <legend>Preferences</legend>
          
          <div class="form-group">
            <label>Preferred Contact Method</label>
            <div class="radio-group">
              <label class="radio-label">
                <input 
                  type="radio" 
                  name="contactMethod" 
                  value="email" 
                  checked={{eq this.preferenceInfo.contactMethod "email"}} 
                  {{on "change" this.updatePreferenceInfo}}
                >
                Email
              </label>
              
              <label class="radio-label">
                <input 
                  type="radio" 
                  name="contactMethod" 
                  value="phone" 
                  checked={{eq this.preferenceInfo.contactMethod "phone"}} 
                  {{on "change" this.updatePreferenceInfo}}
                >
                Phone
              </label>
              
              <label class="radio-label">
                <input 
                  type="radio" 
                  name="contactMethod" 
                  value="mail" 
                  checked={{eq this.preferenceInfo.contactMethod "mail"}} 
                  {{on "change" this.updatePreferenceInfo}}
                >
                Mail
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                name="newsletter" 
                value="yes" 
                checked={{this.preferenceInfo.newsletter}} 
                {{on "change" this.updatePreferenceInfo}}
              >
              Subscribe to newsletter
            </label>
          </div>
          
          <div class="form-group">
            <label>Interests</label>
            <div class="checkbox-group">
              {{#each this.interestOptions as |interest|}}
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="interests" 
                    value={{interest.value}} 
                    checked={{this.isInterestSelected interest.value}} 
                    {{on "change" this.updatePreferenceInfo}}
                  >
                  {{interest.label}}
                </label>
              {{/each}}
            </div>
          </div>
        </fieldset>
        
        <button type="submit" class="submit-button">Submit</button>
      </form>
      
      <div class="preview-container">
        <div class="preview-section">
          <h4>Form Data Preview</h4>
          <div class="data-preview">
            <div class="preview-group">
              <h5>Personal Information</h5>
              <pre>{{JSON.stringify this.personalInfo null 2}}</pre>
            </div>
            
            <div class="preview-group">
              <h5>Address Information</h5>
              <pre>{{JSON.stringify this.addressInfo null 2}}</pre>
            </div>
            
            <div class="preview-group">
              <h5>Preferences</h5>
              <pre>{{JSON.stringify this.preferenceInfo null 2}}</pre>
            </div>
          </div>
        </div>
        
        <div class="preview-section">
          <h4>Submission Result</h4>
          <div class="result-preview">
            {{#if this.formSubmission}}
              <pre>{{JSON.stringify this.formSubmission null 2}}</pre>
            {{else}}
              <p class="empty-message">Form submission result will appear here</p>
            {{/if}}
          </div>
        </div>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates three key concepts with form groups:</p>
        
        <ol>
          <li>
            <strong>Semantic Grouping:</strong> The form uses <code>fieldset</code> and <code>legend</code> elements to create logical groups:
            <pre>
&lt;fieldset&gt;
  &lt;legend&gt;Personal Information&lt;/legend&gt;
  
  &lt;!-- Form inputs for personal information --&gt;
&lt;/fieldset&gt;
            </pre>
          </li>
          
          <li>
            <strong>Grouped State Management:</strong> The component uses separate tracked objects for each group:
            <pre>
@tracked personalInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
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
            <strong>Organized Form Submission:</strong> The form submission handler organizes the flat form data into logical groups:
            <pre>
const formData = new FormData(event.target);
const flatData = Object.fromEntries(formData.entries());

// Organize the flat data into groups
const organizedData = {
  personalInfo: {
    firstName: flatData.firstName,
    lastName: flatData.lastName,
    // ...
  },
  // Other groups...
};
            </pre>
          </li>
        </ol>
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 800px;
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
      
      input, select, textarea {
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
      
      .radio-group, .checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }
      
      .radio-label, .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .radio-label input, .checkbox-label input {
        width: auto;
      }
      
      .submit-button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .preview-container {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
      
      .preview-section {
        flex: 1;
        min-width: 300px;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .data-preview, .result-preview {
        padding: 1rem;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .preview-group {
        margin-bottom: 1rem;
      }
      
      .preview-group h5 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      
      .empty-message {
        color: #999;
        font-style: italic;
      }
      
      pre {
        margin: 0;
        white-space: pre-wrap;
        background-color: #f1f1f1;
        padding: 0.5rem;
        border-radius: 4px;
        overflow-x: auto;
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
  <h2>Form Groups in Ember</h2>
  <FormGroupsDemo />
</template>
