import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

// Simple Card Component
class CardComponent extends Component {
  <template>
    <div class="card">
      <h3>{{@title}}</h3>
      <p>{{@content}}</p>
      {{#if @showButton}}
        <button {{on "click" @onAction}}>{{@buttonText}}</button>
      {{/if}}
    </div>
  </template>
}

// Alert Component
class AlertComponent extends Component {
  <template>
    <div class="alert alert-{{@type}}">
      <div class="alert-icon">
        {{#if (eq @type "success")}}
          ✓
        {{else if (eq @type "warning")}}
          ⚠
        {{else if (eq @type "error")}}
          ✕
        {{else}}
          ℹ
        {{/if}}
      </div>
      <div class="alert-content">
        <h4>{{@title}}</h4>
        <p>{{@message}}</p>
      </div>
    </div>
  </template>
}

// Profile Component
class ProfileComponent extends Component {
  <template>
    <div class="profile">
      <div class="profile-header">
        <div class="avatar" style="background-color: {{@avatarColor}}">
          {{@initials}}
        </div>
        <div class="profile-info">
          <h3>{{@name}}</h3>
          <p>{{@role}}</p>
        </div>
      </div>
      <div class="profile-body">
        <p>{{@bio}}</p>
      </div>
    </div>
  </template>
}

// Stats Component
class StatsComponent extends Component {
  <template>
    <div class="stats">
      {{#each @items as |item|}}
        <div class="stat-item">
          <div class="stat-value">{{item.value}}</div>
          <div class="stat-label">{{item.label}}</div>
        </div>
      {{/each}}
    </div>
  </template>
}

class DynamicRenderingDemo extends Component {
  // Available components for dynamic rendering
  availableComponents = [
    { id: 'card', name: 'Card' },
    { id: 'alert', name: 'Alert' },
    { id: 'profile', name: 'Profile' },
    { id: 'stats', name: 'Stats' }
  ];
  
  // Currently selected component
  @tracked selectedComponent = 'card';
  
  // Component-specific properties
  @tracked cardTitle = 'Card Title';
  @tracked cardContent = 'This is a sample card component with customizable content.';
  @tracked cardShowButton = true;
  @tracked cardButtonText = 'Click Me';
  
  @tracked alertType = 'info';
  @tracked alertTitle = 'Information';
  @tracked alertMessage = 'This is an informational alert message.';
  
  @tracked profileName = 'Jane Doe';
  @tracked profileRole = 'Software Engineer';
  @tracked profileBio = 'Passionate about building great user experiences with Ember.js.';
  @tracked profileAvatarColor = '#3498db';
  
  @tracked statsItems = [
    { label: 'Users', value: '1,234' },
    { label: 'Revenue', value: '$5,678' },
    { label: 'Conversion', value: '12%' },
    { label: 'Growth', value: '+24%' }
  ];
  
  // Alert type options
  alertTypes = [
    { id: 'info', name: 'Info' },
    { id: 'success', name: 'Success' },
    { id: 'warning', name: 'Warning' },
    { id: 'error', name: 'Error' }
  ];
  
  // Get the component name for dynamic rendering
  get componentToRender() {
    return `${this.selectedComponent}-component`;
  }
  
  // Get the initials for the profile avatar
  get profileInitials() {
    return this.profileName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase();
  }
  
  // Actions
  @action
  selectComponent(componentId) {
    this.selectedComponent = componentId;
  }
  
  @action
  handleCardAction() {
    alert('Card button clicked!');
  }
  
  @action
  changeAlertType(event) {
    this.alertType = event.target.value;
  }
  
  @action
  toggleCardButton() {
    this.cardShowButton = !this.cardShowButton;
  }

  <template>
    <div class="demo-container">
      <h3>Dynamic Rendering Demo</h3>
      
      <div class="controls">
        {{#each this.availableComponents as |component|}}
          <button 
            {{on "click" (fn this.selectComponent component.id)}}
            class={{if (eq this.selectedComponent component.id) "active"}}
          >
            {{component.name}}
          </button>
        {{/each}}
      </div>
      
      <div class="component-display">
        {{#if (eq this.selectedComponent "card")}}
          <div class="component-options">
            <h4>Card Options</h4>
            <div class="option-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={{this.cardShowButton}} 
                  {{on "change" this.toggleCardButton}}
                >
                Show Button
              </label>
            </div>
          </div>
        {{else if (eq this.selectedComponent "alert")}}
          <div class="component-options">
            <h4>Alert Options</h4>
            <div class="option-group">
              <label>Type:</label>
              <select value={{this.alertType}} {{on "change" this.changeAlertType}}>
                {{#each this.alertTypes as |type|}}
                  <option value={{type.id}}>{{type.name}}</option>
                {{/each}}
              </select>
            </div>
          </div>
        {{/if}}
        
        <div class="component-preview">
          {{component this.componentToRender
            title=this.cardTitle
            content=this.cardContent
            showButton=this.cardShowButton
            buttonText=this.cardButtonText
            onAction=this.handleCardAction
            type=this.alertType
            message=this.alertMessage
            name=this.profileName
            role=this.profileRole
            bio=this.profileBio
            avatarColor=this.profileAvatarColor
            initials=this.profileInitials
            items=this.statsItems
          }}
        </div>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates dynamic rendering using the component helper:</p>
        
        <pre>
{{component this.componentToRender
  title=this.cardTitle
  content=this.cardContent
  // Other properties...
}}
        </pre>
        
        <p>The <code>componentToRender</code> property dynamically determines which component to render:</p>
        
        <pre>
get componentToRender() {
  return `${this.selectedComponent}-component`;
}
        </pre>
        
        <p>This allows us to switch between different components at runtime based on user selection.</p>
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 600px;
      }
      
      .controls {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding: 1rem;
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
      
      button.active {
        background-color: #2ecc71;
      }
      
      .component-display {
        margin-bottom: 1.5rem;
      }
      
      .component-options {
        margin-bottom: 1rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .component-options h4 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      
      .option-group {
        margin-bottom: 0.5rem;
      }
      
      label {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-right: 1rem;
      }
      
      select {
        padding: 0.25rem 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .component-preview {
        padding: 1rem;
        min-height: 100px;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      /* Card Component Styles */
      .card {
        padding: 1rem;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .card h3 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      
      .card p {
        margin-bottom: 1rem;
      }
      
      /* Alert Component Styles */
      .alert {
        display: flex;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
      }
      
      .alert-info {
        background-color: #e3f2fd;
        border-left: 4px solid #2196f3;
      }
      
      .alert-success {
        background-color: #e8f5e9;
        border-left: 4px solid #4caf50;
      }
      
      .alert-warning {
        background-color: #fff8e1;
        border-left: 4px solid #ff9800;
      }
      
      .alert-error {
        background-color: #ffebee;
        border-left: 4px solid #f44336;
      }
      
      .alert-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin-right: 1rem;
        font-weight: bold;
      }
      
      .alert-content h4 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      
      .alert-content p {
        margin: 0;
      }
      
      /* Profile Component Styles */
      .profile {
        padding: 1rem;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .profile-header {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        margin-right: 1rem;
        background-color: #3498db;
        color: white;
        font-weight: bold;
        border-radius: 50%;
      }
      
      .profile-info h3 {
        margin-top: 0;
        margin-bottom: 0.25rem;
      }
      
      .profile-info p {
        margin: 0;
        color: #666;
      }
      
      /* Stats Component Styles */
      .stats {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }
      
      .stat-item {
        flex: 1;
        min-width: 100px;
        padding: 1rem;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        text-align: center;
      }
      
      .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }
      
      .stat-label {
        color: #666;
      }
      
      .explanation {
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
  <h2>Dynamic Rendering in Ember</h2>
  <DynamicRenderingDemo />
</template>
