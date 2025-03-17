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
        animation: pulse 2s infinite;
      }
      
      .action-button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        animation: bounce 0.5s ease;
      }
      
      .message {
        margin-top: 1rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        animation: fadeIn 0.5s ease-in;
      }
      
      @keyframes pulse {
        0% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
        }
        
        50% {
          transform: scale(1.1);
          box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
        }
        
        100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
        }
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
          transform: translateY(0);
        }
        
        40% {
          transform: translateY(-10px);
        }
        
        60% {
          transform: translateY(-5px);
        }
      }
      
      @keyframes fadeIn {
        0% {
          opacity: 0;
          transform: translateY(10px);
        }
        
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>
  </template>
}

<template>
  <h2>CSS Keyframe Animations Demo</h2>
  <KeyframeDemo />
</template>
