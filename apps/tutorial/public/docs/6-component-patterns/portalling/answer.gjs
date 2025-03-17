import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class PortalledContent extends Component {
  @action
  close() {
    this.args.onClose();
  }
  
  <template>
    <div class="portalled-content">
      <div class="portalled-header">
        <h3>{{@title}}</h3>
        <button class="close-button" {{on "click" this.close}}>×</button>
      </div>
      
      <div class="portalled-body">
        <p>{{@content}}</p>
        
        {{#if @showInput}}
          <div class="input-group">
            <label for="portal-input">Enter a value:</label>
            <input 
              type="text" 
              id="portal-input" 
              value={{@inputValue}} 
              {{on "input" @onInputChange}}
            >
          </div>
        {{/if}}
      </div>
      
      <div class="portalled-footer">
        <button {{on "click" this.close}}>Close</button>
        {{#if @onConfirm}}
          <button class="confirm-button" {{on "click" @onConfirm}}>Confirm</button>
        {{/if}}
      </div>
    </div>
  </template>
}

class PortallingDemo extends Component {
  // Track whether the portal is visible
  @tracked isPortalVisible = false;
  
  // Track the content for the portal
  @tracked portalTitle = 'Portalled Content';
  @tracked portalContent = 'This content is rendered in a different part of the DOM using the {{in-element}} helper.';
  
  // Track input value for demonstration
  @tracked inputValue = '';
  @tracked showInput = true;
  
  // Get a reference to the portal target element
  get portalTarget() {
    return document.getElementById('portal-target');
  }
  
  // Actions
  @action
  showPortal() {
    this.isPortalVisible = true;
  }
  
  @action
  hidePortal() {
    this.isPortalVisible = false;
  }
  
  @action
  updateInputValue(event) {
    this.inputValue = event.target.value;
  }
  
  @action
  handleConfirm() {
    alert(`Confirmed with value: ${this.inputValue || 'No value entered'}`);
    this.hidePortal();
  }
  
  @action
  toggleInput() {
    this.showInput = !this.showInput;
  }

  <template>
    <div class="demo-container">
      <h3>Portalling Demo</h3>
      
      <div class="content-section">
        <p>This is the main content of the component. The button below will trigger content to be rendered in a different part of the DOM.</p>
        
        <button {{on "click" this.showPortal}}>
          Show Portalled Content
        </button>
        
        {{#if this.showInput}}
          <div class="input-preview">
            <p>Current input value: <strong>{{if this.inputValue this.inputValue "No value entered"}}</strong></p>
          </div>
        {{/if}}
        
        <div class="controls">
          <button {{on "click" this.toggleInput}} class="toggle-button">
            {{if this.showInput "Hide Input" "Show Input"}}
          </button>
        </div>
      </div>
      
      {{#if this.isPortalVisible}}
        {{#in-element this.portalTarget}}
          <PortalledContent 
            title={{this.portalTitle}}
            content={{this.portalContent}}
            showInput={{this.showInput}}
            inputValue={{this.inputValue}}
            onInputChange={{this.updateInputValue}}
            onClose={{this.hidePortal}}
            onConfirm={{this.handleConfirm}}
          />
        {{/in-element}}
      {{/if}}
      
      <div id="portal-target" class="portal-target">
        <p class="portal-placeholder">
          {{#if this.isPortalVisible}}
            Content is currently being portalled to this element.
          {{else}}
            This is the portal target. Content will be portalled here when the button is clicked.
          {{/if}}
        </p>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates portalling using the <code>{{in-element}}</code> helper:</p>
        
        <pre>
{{#if this.isPortalVisible}}
  {{#in-element this.portalTarget}}
    <PortalledContent 
      title={{this.portalTitle}}
      content={{this.portalContent}}
      showInput={{this.showInput}}
      inputValue={{this.inputValue}}
      onInputChange={{this.updateInputValue}}
      onClose={{this.hidePortal}}
      onConfirm={{this.handleConfirm}}
    />
  {{/in-element}}
{{/if}}
        </pre>
        
        <p>The <code>portalTarget</code> getter retrieves the DOM element to portal content to:</p>
        
        <pre>
get portalTarget() {
  return document.getElementById('portal-target');
}
        </pre>
        
        <p>Note that the portalled content maintains its component context and reactivity, allowing it to interact with the parent component's state.</p>
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 600px;
      }
      
      .content-section {
        padding: 1rem;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 1rem;
      }
      
      .input-preview {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #e8f5e9;
        border-radius: 4px;
      }
      
      .controls {
        margin-top: 1rem;
      }
      
      button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      button.toggle-button {
        background-color: #9b59b6;
      }
      
      .portal-target {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #f1f1f1;
        border: 2px dashed #aaa;
        border-radius: 4px;
        min-height: 100px;
      }
      
      .portal-placeholder {
        color: #666;
        font-style: italic;
        text-align: center;
      }
      
      .portalled-content {
        padding: 1rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      .portalled-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
      }
      
      .portalled-header h3 {
        margin: 0;
      }
      
      .close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #666;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .portalled-body {
        margin-bottom: 1rem;
      }
      
      .input-group {
        margin-top: 1rem;
      }
      
      .input-group label {
        display: block;
        margin-bottom: 0.5rem;
      }
      
      .input-group input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .portalled-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid #eee;
      }
      
      .confirm-button {
        background-color: #2ecc71;
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
  <h2>Portalling in Ember</h2>
  <PortallingDemo />
</template>
