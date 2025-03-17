import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { modifier } from 'ember-modifier';

// Custom conditional modifier that applies a class based on a condition
const conditionalClass = modifier((element, [condition, className]) => {
  if (condition) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
  
  return () => {
    element.classList.remove(className);
  };
});

// Custom conditional modifier that applies a style based on a condition
const conditionalStyle = modifier((element, [condition, property, value]) => {
  if (condition) {
    element.style[property] = value;
  } else {
    element.style[property] = '';
  }
  
  return () => {
    element.style[property] = '';
  };
});

class ConditionalModifiersDemo extends Component {
  // Conditional event listeners
  @tracked isButtonEnabled = true;
  @tracked clickCount = 0;
  @tracked lastClickTime = null;
  
  // Toggle button
  @tracked isToggleActive = false;
  @tracked toggleClickCount = 0;
  
  // Hover card
  @tracked isHovering = false;
  @tracked hoverMessage = 'Hover over the card to see the effect';
  
  // Custom conditional modifier
  @tracked themeMode = 'light';
  @tracked elementStates = [
    { id: 1, isActive: false },
    { id: 2, isActive: true },
    { id: 3, isActive: false }
  ];
  
  get isDarkMode() {
    return this.themeMode === 'dark';
  }
  
  @action
  toggleButtonState() {
    this.isButtonEnabled = !this.isButtonEnabled;
  }
  
  @action
  handleButtonClick() {
    this.clickCount++;
    this.lastClickTime = new Date().toLocaleTimeString();
  }
  
  @action
  toggleActiveState() {
    this.isToggleActive = !this.isToggleActive;
    this.toggleClickCount++;
  }
  
  @action
  handleToggleMouseEnter() {
    if (this.isToggleActive) {
      console.log('Mouse entered active toggle button');
    }
  }
  
  @action
  handleToggleMouseLeave() {
    if (this.isToggleActive) {
      console.log('Mouse left active toggle button');
    }
  }
  
  @action
  handleHoverEnter() {
    this.isHovering = true;
    this.hoverMessage = 'Card is being hovered!';
  }
  
  @action
  handleHoverLeave() {
    this.isHovering = false;
    this.hoverMessage = 'Hover over the card to see the effect';
  }
  
  @action
  toggleTheme() {
    this.themeMode = this.isDarkMode ? 'light' : 'dark';
  }
  
  @action
  toggleElementState(elementId) {
    this.elementStates = this.elementStates.map(element => {
      if (element.id === elementId) {
        return { ...element, isActive: !element.isActive };
      }
      return element;
    });
  }

  <template>
    <div class="demo-container">
      <h3>Conditional Modifiers Demo</h3>
      
      <div class="section">
        <h4>Conditional Event Listeners</h4>
        
        <div class="demo-box">
          <button 
            {{if this.isButtonEnabled (on "click" this.handleButtonClick)}}
            disabled={{not this.isButtonEnabled}}
          >
            {{if this.isButtonEnabled "Click me" "Button disabled"}}
          </button>
          
          <button {{on "click" this.toggleButtonState}} class="toggle-button">
            {{if this.isButtonEnabled "Disable Button" "Enable Button"}}
          </button>
          
          <div class="result-display">
            {{#if this.clickCount}}
              <p>Button clicked {{this.clickCount}} times</p>
              <p>Last click: {{this.lastClickTime}}</p>
            {{else}}
              <p>Button has not been clicked yet</p>
            {{/if}}
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Toggle Button with Different Modifiers</h4>
        
        <div class="demo-box">
          <button 
            class={{if this.isToggleActive "active"}}
            {{on "click" this.toggleActiveState}}
            {{if this.isToggleActive (on "mouseenter" this.handleToggleMouseEnter)}}
            {{if this.isToggleActive (on "mouseleave" this.handleToggleMouseLeave)}}
          >
            {{if this.isToggleActive "Active" "Inactive"}}
          </button>
          
          <div class="result-display">
            <p>Button state: <strong>{{if this.isToggleActive "Active" "Inactive"}}</strong></p>
            <p>Toggle clicked {{this.toggleClickCount}} times</p>
            <p class="hint">{{if this.isToggleActive "Mouse events are now being tracked (see console)" "Activate the button to enable mouse event tracking"}}</p>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Hover Card with Conditional Modifiers</h4>
        
        <div class="demo-box">
          <div 
            class="hover-card {{if this.isHovering "active"}}"
            {{on "mouseenter" this.handleHoverEnter}}
            {{on "mouseleave" this.handleHoverLeave}}
          >
            <h5>Hover Card</h5>
            <p>{{this.hoverMessage}}</p>
            
            {{#if this.isHovering}}
              <div class="hover-content">
                <p>This content only appears when hovering!</p>
                <button {{on "click" this.handleHoverLeave}}>
                  Close
                </button>
              </div>
            {{/if}}
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Custom Conditional Modifier</h4>
        
        <div class="demo-box">
          {{#each this.elementStates as |element|}}
            <div 
              class="custom-element"
              {{conditionalClass element.isActive "active-element"}}
              {{conditionalStyle element.isActive "borderLeftColor" "#3498db"}}
              {{conditionalStyle this.isDarkMode "backgroundColor" "#2c3e50"}}
              {{conditionalStyle this.isDarkMode "color" "white"}}
            >
              Element {{element.id}}: {{if element.isActive "Active" "Inactive"}}
              
              <button 
                {{on "click" (fn this.toggleElementState element.id)}}
                class="small-button"
              >
                Toggle
              </button>
            </div>
          {{/each}}
          
          <div class="controls">
            <button {{on "click" this.toggleTheme}} class="theme-button">
              Switch to {{if this.isDarkMode "Light" "Dark"}} Theme
            </button>
          </div>
        </div>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates four key concepts with conditional modifiers:</p>
        
        <ol>
          <li>
            <strong>Conditional Event Listeners:</strong> Using the if helper to conditionally apply event listeners:
            <pre>
<button 
  {{if this.isButtonEnabled (on "click" this.handleButtonClick)}}
  disabled={{not this.isButtonEnabled}}
>
  {{if this.isButtonEnabled "Click me" "Button disabled"}}
</button>
            </pre>
          </li>
          
          <li>
            <strong>Multiple Conditional Modifiers:</strong> Applying different modifiers based on state:
            <pre>
<button 
  class={{if this.isToggleActive "active"}}
  {{on "click" this.toggleActiveState}}
  {{if this.isToggleActive (on "mouseenter" this.handleToggleMouseEnter)}}
  {{if this.isToggleActive (on "mouseleave" this.handleToggleMouseLeave)}}
>
  {{if this.isToggleActive "Active" "Inactive"}}
</button>
            </pre>
          </li>
          
          <li>
            <strong>Conditional Content with Modifiers:</strong> Combining conditional content with modifiers:
            <pre>
<div 
  class="hover-card {{if this.isHovering "active"}}"
  {{on "mouseenter" this.handleHoverEnter}}
  {{on "mouseleave" this.handleHoverLeave}}
>
  <!-- Content -->
  
  {{#if this.isHovering}}
    <div class="hover-content">
      <!-- Additional content when hovering -->
    </div>
  {{/if}}
</div>
            </pre>
          </li>
          
          <li>
            <strong>Custom Conditional Modifiers:</strong> Creating and using custom modifiers with conditional logic:
            <pre>
const conditionalClass = modifier((element, [condition, className]) => {
  if (condition) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
  
  return () => {
    element.classList.remove(className);
  };
});

// Usage:
<div 
  {{conditionalClass element.isActive "active-element"}}
  {{conditionalStyle this.isDarkMode "backgroundColor" "#2c3e50"}}
>
  <!-- Content -->
</div>
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
      
      .demo-box {
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
        margin-right: 0.5rem;
      }
      
      button:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
      }
      
      button.active {
        background-color: #2ecc71;
      }
      
      button.toggle-button {
        background-color: #e74c3c;
      }
      
      button.theme-button {
        background-color: #9b59b6;
      }
      
      button.small-button {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
        float: right;
      }
      
      .result-display {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        min-height: 2rem;
      }
      
      .result-display p {
        margin: 0.5rem 0;
      }
      
      .hint {
        font-style: italic;
        color: #666;
      }
      
      .hover-card {
        padding: 1rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        transition: all 0.3s ease;
      }
      
      .hover-card.active {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-4px);
        border-color: #3498db;
      }
      
      .hover-card h5 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      
      .hover-content {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #e1f5fe;
        border-radius: 4px;
      }
      
      .controls {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
      }
      
      .custom-element {
        padding: 1rem;
        margin-bottom: 0.5rem;
        background-color: white;
        border: 1px solid #ddd;
        border-left-width: 4px;
        border-radius: 4px;
        transition: all 0.3s ease;
      }
      
      .active-element {
        background-color: #f8f9fa;
        border-color: #3498db;
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
  <h2>Conditional Modifiers in Ember</h2>
  <ConditionalModifiersDemo />
</template>
