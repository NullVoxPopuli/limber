import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { resource } from 'ember-resources';

// TODO: Create an async data resource

class AsyncStateDemo extends Component {
  // TODO: Use the async data resource
  
  // TODO: Add tracked properties for demo configuration
  
  // TODO: Add actions for triggering different async scenarios
  
  <template>
    <div class="demo-container">
      <h3>Encapsulating Async State Demo</h3>
      
      <div class="section">
        <h4>Async Data Fetching</h4>
        
        <div class="controls">
          {{! TODO: Add controls for triggering different async scenarios }}
        </div>
        
        <div class="data-display">
          {{! TODO: Display different UI based on async state }}
        </div>
      </div>
      
      <div class="section">
        <h4>Async Operation with Retry</h4>
        
        <div class="operation-panel">
          {{! TODO: Add an async operation with retry functionality }}
        </div>
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
      
      .controls {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      
      button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      button.retry {
        background-color: #2ecc71;
      }
      
      button.error {
        background-color: #e74c3c;
      }
      
      .data-display {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        min-height: 200px;
      }
      
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
      }
      
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-left-color: #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .error-display {
        padding: 1rem;
        background-color: #ffebee;
        border-left: 4px solid #e74c3c;
        border-radius: 4px;
      }
      
      .data-item {
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .operation-panel {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
    </style>
  </template>
}

<template>
  <h2>Encapsulating Async State in Ember</h2>
  <AsyncStateDemo />
</template>
