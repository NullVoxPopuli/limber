import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class PortallingDemo extends Component {
  // TODO: Add tracked properties for portal state
  
  // TODO: Add getter for portal target element
  
  // TODO: Add actions for showing and hiding portalled content
  
  <template>
    <div class="demo-container">
      <h3>Portalling Demo</h3>
      
      <div class="content-section">
        <p>This is the main content of the component. The button below will trigger content to be rendered in a different part of the DOM.</p>
        
        {{! TODO: Add button to trigger portal }}
      </div>
      
      {{! TODO: Add portal implementation }}
      
      {{! TODO: Create portal target }}
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
      
      button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .portal-target {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #f1f1f1;
        border: 2px dashed #aaa;
        border-radius: 4px;
      }
      
      .portalled-content {
        padding: 1rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
    </style>
  </template>
}

<template>
  <h2>Portalling in Ember</h2>
  <PortallingDemo />
</template>
