import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class KeyframeDemo extends Component {
  @tracked showMessage = false;
  @tracked notificationCount = 3;
  
  @action
  toggleMessage() {
    this.showMessage = !this.showMessage;
  }

  <template>
    <div class="demo-container">
      <div class="header">
        <h3>Keyframe Animations</h3>
        
        <div class="notification">
          <span class="badge">
            {{this.notificationCount}}
          </span>
        </div>
      </div>
      
      <button class="action-button" {{on "click" this.toggleMessage}}>
        {{if this.showMessage "Hide Message" "Show Message"}}
      </button>
      
      {{#if this.showMessage}}
        <div class="message">
          <p>This message should fade in with a keyframe animation!</p>
          <p>Keyframe animations allow for more complex animation sequences than simple transitions.</p>
        </div>
      {{/if}}
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 500px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .notification {
        position: relative;
      }
      
      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background-color: #e74c3c;
        color: white;
        border-radius: 50%;
        font-size: 0.8rem;
        /* TODO: Add pulse animation */
      }
      
      .action-button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        /* TODO: Add bounce animation */
      }
      
      .message {
        margin-top: 1rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        /* TODO: Add fade-in animation */
      }
      
      /* TODO: Define @keyframes for pulse animation */
      
      /* TODO: Define @keyframes for bounce animation */
      
      /* TODO: Define @keyframes for fade-in animation */
    </style>
  </template>
}

<template>
  <h2>CSS Keyframe Animations Demo</h2>
  <KeyframeDemo />
</template>
