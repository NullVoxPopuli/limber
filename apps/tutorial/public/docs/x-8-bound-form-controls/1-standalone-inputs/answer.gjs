import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class StandaloneInputsDemo extends Component {
  // Basic input values
  @tracked name = '';
  @tracked age = '';
  @tracked subscribed = false;
  
  // Validation input values
  @tracked email = '';
  @tracked password = '';
  
  // Validation states
  @tracked emailValid = true;
  @tracked passwordValid = true;
  @tracked emailError = '';
  @tracked passwordError = '';
  
  // Submission result
  @tracked submissionResult = null;
  
  get isFormValid() {
    return (
      this.name && 
      this.age && 
      this.emailValid && 
      this.passwordValid && 
      this.email && 
      this.password
    );
  }
  
  get formattedAge() {
    const age = parseInt(this.age, 10);
    if (isNaN(age)) return '';
    
    if (age < 18) {
      return 'Youth';
    } else if (age < 30) {
      return 'Young Adult';
    } else if (age < 50) {
      return 'Adult';
    } else if (age < 70) {
      return 'Senior Adult';
    } else {
      return 'Elder';
    }
  }
  
  @action
  updateName(event) {
    this.name = event.target.value;
  }
  
  @action
  updateAge(event) {
    this.age = event.target.value;
  }
  
  @action
  updateSubscription(event) {
    this.subscribed = event.target.checked;
  }
  
  @action
  validateEmail(event) {
    this.email = event.target.value;
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!this.email) {
      this.emailValid = false;
      this.emailError = 'Email is required';
    } else if (!emailRegex.test(this.email)) {
      this.emailValid = false;
      this.emailError = 'Please enter a valid email address';
    } else {
      this.emailValid = true;
      this.emailError = '';
    }
  }
  
  @action
  validatePassword(event) {
    this.password = event.target.value;
    
    if (!this.password) {
      this.passwordValid = false;
      this.passwordError = 'Password is required';
    } else if (this.password.length < 8) {
      this.passwordValid = false;
      this.passwordError = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(this.password)) {
      this.passwordValid = false;
      this.passwordError = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(this.password)) {
      this.passwordValid = false;
      this.passwordError = 'Password must contain at least one number';
    } else {
      this.passwordValid = true;
      this.passwordError = '';
    }
  }
  
  @action
  handleSubmit() {
    if (this.isFormValid) {
      this.submissionResult = {
        name: this.name,
        age: this.age,
        subscribed: this.subscribed,
        email: this.email,
        passwordLength: this.password.length
      };
      
      console.log('Form submitted:', this.submissionResult);
    }
  }

  <template>
    <div class="demo-container">
      <h3>Standalone Inputs Demo</h3>
      
      <div class="section">
        <h4>Basic Inputs</h4>
        
        <div class="input-group">
          <label for="name-input">Name:</label>
          <input 
            type="text" 
            id="name-input" 
            value={{this.name}} 
            {{on "input" this.updateName}}
            placeholder="Enter your name"
          >
        </div>
        
        <div class="input-group">
          <label for="age-input">Age:</label>
          <input 
            type="number" 
            id="age-input" 
            value={{this.age}} 
            {{on "input" this.updateAge}}
            min="0" 
            max="120"
            placeholder="Enter your age"
          >
        </div>
        
        <div class="input-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              checked={{this.subscribed}} 
              {{on "change" this.updateSubscription}}
            >
            Subscribe to newsletter
          </label>
        </div>
      </div>
      
      <div class="section">
        <h4>Validation Example</h4>
        
        <div class="input-group">
          <label for="email-input">Email:</label>
          <input 
            type="email" 
            id="email-input" 
            value={{this.email}} 
            class={{if (not this.emailValid) "invalid"}}
            {{on "input" this.validateEmail}}
            placeholder="Enter your email"
          >
          
          {{#if this.emailError}}
            <div class="validation-message error">
              {{this.emailError}}
            </div>
          {{else if this.email}}
            <div class="validation-message success">
              Email is valid
            </div>
          {{/if}}
        </div>
        
        <div class="input-group">
          <label for="password-input">Password:</label>
          <input 
            type="password" 
            id="password-input" 
            value={{this.password}} 
            class={{if (not this.passwordValid) "invalid"}}
            {{on "input" this.validatePassword}}
            placeholder="Enter your password"
          >
          
          {{#if this.passwordError}}
            <div class="validation-message error">
              {{this.passwordError}}
            </div>
          {{else if this.password}}
            <div class="validation-message success">
              Password is valid
            </div>
          {{/if}}
        </div>
      </div>
      
      <div class="section">
        <h4>Live Preview</h4>
        
        <div class="preview-container">
          <div class="preview-item">
            <strong>Name:</strong> {{if this.name this.name "Not provided"}}
          </div>
          
          <div class="preview-item">
            <strong>Age:</strong> {{if this.age this.age "Not provided"}}
            {{#if this.formattedAge}}
              <span class="age-category">({{this.formattedAge}})</span>
            {{/if}}
          </div>
          
          <div class="preview-item">
            <strong>Newsletter:</strong> {{if this.subscribed "Subscribed" "Not subscribed"}}
          </div>
          
          <div class="preview-item">
            <strong>Email:</strong> 
            {{#if this.emailValid}}
              {{if this.email this.email "Not provided"}}
            {{else}}
              <span class="invalid-value">Invalid email</span>
            {{/if}}
          </div>
          
          <div class="preview-item">
            <strong>Password:</strong> 
            {{#if this.passwordValid}}
              <span class="secure-value">Secure password provided</span>
            {{else}}
              <span class="invalid-value">Invalid password</span>
            {{/if}}
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Submit Action</h4>
        
        <button 
          type="button" 
          class="submit-button" 
          disabled={{not this.isFormValid}}
          {{on "click" this.handleSubmit}}
        >
          Submit
        </button>
        
        <div class="result">
          {{#if this.submissionResult}}
            <h5>Submission Successful!</h5>
            <div class="result-item">
              <strong>Name:</strong> {{this.submissionResult.name}}
            </div>
            <div class="result-item">
              <strong>Age:</strong> {{this.submissionResult.age}}
            </div>
            <div class="result-item">
              <strong>Newsletter:</strong> {{if this.submissionResult.subscribed "Yes" "No"}}
            </div>
            <div class="result-item">
              <strong>Email:</strong> {{this.submissionResult.email}}
            </div>
            <div class="result-item">
              <strong>Password:</strong> {{this.submissionResult.passwordLength}} characters (secure)
            </div>
          {{else}}
            <p class="empty-result">
              {{#if this.isFormValid}}
                Click submit to see the result
              {{else}}
                Please fill out all fields correctly
              {{/if}}
            </p>
          {{/if}}
        </div>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates three key concepts with standalone inputs:</p>
        
        <ol>
          <li>
            <strong>Controlled Inputs:</strong> Each input is controlled by a tracked property:
            <pre>
@tracked name = '';

@action
updateName(event) {
  this.name = event.target.value;
}
            </pre>
          </li>
          
          <li>
            <strong>Real-time Validation:</strong> Inputs are validated as the user types:
            <pre>
@action
validateEmail(event) {
  this.email = event.target.value;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!this.email) {
    this.emailValid = false;
    this.emailError = 'Email is required';
  } else if (!emailRegex.test(this.email)) {
    this.emailValid = false;
    this.emailError = 'Please enter a valid email address';
  } else {
    this.emailValid = true;
    this.emailError = '';
  }
}
            </pre>
          </li>
          
          <li>
            <strong>Derived State:</strong> The component computes derived values from the input state:
            <pre>
get isFormValid() {
  return (
    this.name && 
    this.age && 
    this.emailValid && 
    this.passwordValid && 
    this.email && 
    this.password
  );
}

get formattedAge() {
  const age = parseInt(this.age, 10);
  if (isNaN(age)) return '';
  
  if (age < 18) {
    return 'Youth';
  } else if (age < 30) {
    return 'Young Adult';
  } // ...and so on
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
      
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      input[type="text"],
      input[type="number"],
      input[type="email"],
      input[type="password"] {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      input.invalid {
        border-color: #e74c3c;
      }
      
      .validation-message {
        margin-top: 0.25rem;
        font-size: 0.875rem;
      }
      
      .validation-message.error {
        color: #e74c3c;
      }
      
      .validation-message.success {
        color: #2ecc71;
      }
      
      .preview-container {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .preview-item {
        margin-bottom: 0.5rem;
      }
      
      .age-category {
        font-style: italic;
        color: #666;
        margin-left: 0.5rem;
      }
      
      .invalid-value {
        color: #e74c3c;
        font-style: italic;
      }
      
      .secure-value {
        color: #2ecc71;
      }
      
      .submit-button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .submit-button:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
      }
      
      .result {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .result-item {
        margin-bottom: 0.5rem;
      }
      
      .empty-result {
        color: #666;
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
  <h2>Standalone Inputs in Ember</h2>
  <StandaloneInputsDemo />
</template>
