import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { resource } from 'ember-resources';

// TODO: Create a clock resource

class ClockDemo extends Component {
  // TODO: Use the clock resource
  
  // TODO: Add computed properties for formatted time
  
  // TODO: Add actions for configuration changes
  
  <template>
    <div class="demo-container">
      <h3>Clock Resource Demo</h3>
      
      <div class="section">
        <h4>Digital Clock</h4>
        
        <div class="clock-display">
          {{! TODO: Display digital clock }}
        </div>
      </div>
      
      <div class="section">
        <h4>Analog Clock</h4>
        
        <div class="analog-clock">
          {{! TODO: Create analog clock with rotating hands }}
        </div>
      </div>
      
      <div class="section">
        <h4>Configuration</h4>
        
        <div class="config-panel">
          {{! TODO: Add configuration options }}
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
      
      .clock-display {
        font-size: 2rem;
        font-family: monospace;
        text-align: center;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .analog-clock {
        position: relative;
        width: 200px;
        height: 200px;
        margin: 0 auto;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 50%;
      }
      
      .clock-face {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      
      .clock-hand {
        position: absolute;
        bottom: 50%;
        left: 50%;
        transform-origin: bottom center;
        background-color: #333;
      }
      
      .hour-hand {
        width: 4px;
        height: 30%;
        margin-left: -2px;
      }
      
      .minute-hand {
        width: 3px;
        height: 40%;
        margin-left: -1.5px;
      }
      
      .second-hand {
        width: 2px;
        height: 45%;
        margin-left: -1px;
        background-color: #e74c3c;
      }
      
      .clock-center {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        margin-top: -5px;
        margin-left: -5px;
        background-color: #333;
        border-radius: 50%;
      }
      
      .config-panel {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .config-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      label {
        min-width: 120px;
      }
      
      select, input {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
    </style>
  </template>
}

<template>
  <h2>Clock Resource in Ember</h2>
  <ClockDemo />
</template>
