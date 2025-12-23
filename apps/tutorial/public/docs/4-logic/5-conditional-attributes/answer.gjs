import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class ConditionalAttributes extends Component {
  @tracked isLoading = false;
  @tracked buttonState = 'default'; // 'default', 'success', 'danger'
  @tracked hasNotification = true;
  
  @action
  toggleLoading() {
    this.isLoading = !this.isLoading;
    
    if (this.isLoading) {
      // Simulate an async operation
      setTimeout(() => {
        this.isLoading = false;
        this.buttonState = 'success';
      }, 2000);
    } else {
      this.buttonState = 'default';
    }
  }
  
  @action
  toggleNotification() {
    this.hasNotification = !this.hasNotification;
  }
  
  @action
  resetState() {
    this.buttonState = 'default';
  }
  
  @action
  setDangerState() {
    this.buttonState = 'danger';
  }

  <template>
    <div class="demo-container">
      <h3>Conditional Attributes Demo</h3>
      
      <div class="button-container">
        <button 
          class="action-button {{this.buttonState}}"
          {{on "click" this.toggleLoading}}
          disabled={{this.isLoading}}
        >
          {{if this.isLoading "Loading..." "Submit"}}
        </button>
        
        <div class="button-controls">
          <button {{on "click" this.resetState}}>Reset</button>
          <button {{on "click" this.setDangerState}}>Set Danger</button>
        </div>
      </div>
      
      <div class="notification-container">
        <button {{on "click" this.toggleNotification}}>
          {{if this.hasNotification "Hide" "Show"}} Notification
        </button>
        
        <div 
          class="notification {{if this.hasNotification 'visible' 'hidden'}}"
          aria-hidden={{if this.hasNotification false true}}
          aria-live={{if this.hasNotification "polite" "off"}}
        >
          <p>This is an important notification!</p>
        </div>
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 500px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .button-container {
        margin-bottom: 1rem;
      }
      
      .action-button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        min-width: 100px;
      }
      
      .action-button.success {
        background-color: #2ecc71;
      }
      
      .action-button.danger {
        background-color: #e74c3c;
      }
      
      .action-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      
      .button-controls {
        margin-top: 0.5rem;
        display: flex;
        gap: 0.5rem;
      }
      
      .button-controls button {
        padding: 0.25rem 0.5rem;
        background-color: #f8f9fa;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .notification-container {
        margin-top: 1rem;
      }
      
      .notification {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .notification.visible {
        display: block;
      }
      
      .notification.hidden {
        display: none;
      }
    </style>
  </template>
}

<template>
  <h2>Conditional Attribute Rendering</h2>
  <ConditionalAttributes />
</template>
