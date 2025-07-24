import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { resource } from 'ember-resources';

// Clock resource that provides time updates
const Clock = resource(({ on, use }) => {
  // Get configuration options with defaults
  const updateInterval = use?.args?.named?.updateInterval ?? 1000;
  
  // Create a tracked object to hold the time
  const clock = {
    @tracked time: new Date()
  };
  
  // Update the time at the specified interval
  const intervalId = setInterval(() => {
    clock.time = new Date();
  }, updateInterval);
  
  // Clean up the interval when the resource is destroyed
  on.cleanup(() => {
    clearInterval(intervalId);
  });
  
  return clock;
});

class ClockDemo extends Component {
  // Configuration options
  @tracked updateInterval = 1000;
  @tracked showSeconds = true;
  @tracked clockFormat = '24hour';
  
  // Use the clock resource with the current update interval
  get clock() {
    return Clock({ updateInterval: this.updateInterval });
  }
  
  // Format the time for the digital display
  get formattedTime() {
    const time = this.clock.time;
    
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: this.clockFormat === '12hour'
    };
    
    if (this.showSeconds) {
      options.second = '2-digit';
    }
    
    return time.toLocaleTimeString(undefined, options);
  }
  
  // Calculate the rotation angles for the clock hands
  get hourRotation() {
    const time = this.clock.time;
    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();
    
    // Each hour is 30 degrees, plus a small amount for the minutes
    return (hours * 30) + (minutes * 0.5);
  }
  
  get minuteRotation() {
    const time = this.clock.time;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    
    // Each minute is 6 degrees, plus a small amount for the seconds
    return (minutes * 6) + (seconds * 0.1);
  }
  
  get secondRotation() {
    const time = this.clock.time;
    const seconds = time.getSeconds();
    
    // Each second is 6 degrees
    return seconds * 6;
  }
  
  // Actions for configuration changes
  @action
  updateClockFormat(event) {
    this.clockFormat = event.target.value;
  }
  
  @action
  toggleShowSeconds(event) {
    this.showSeconds = event.target.checked;
  }
  
  @action
  updateInterval(event) {
    this.updateInterval = parseInt(event.target.value, 10);
  }

  <template>
    <div class="demo-container">
      <h3>Clock Resource Demo</h3>
      
      <div class="section">
        <h4>Digital Clock</h4>
        
        <div class="clock-display">
          {{this.formattedTime}}
        </div>
      </div>
      
      <div class="section">
        <h4>Analog Clock</h4>
        
        <div class="analog-clock">
          <div class="clock-face">
            {{#each (array 1 2 3 4 5 6 7 8 9 10 11 12) as |hour|}}
              <div class="hour-marker" style="transform: rotate({{mul hour 30}}deg)">
                <span style="transform: rotate({{mul hour -30}}deg)">{{hour}}</span>
              </div>
            {{/each}}
            
            <div class="clock-hand hour-hand" style="transform: rotate({{this.hourRotation}}deg)"></div>
            <div class="clock-hand minute-hand" style="transform: rotate({{this.minuteRotation}}deg)"></div>
            
            {{#if this.showSeconds}}
              <div class="clock-hand second-hand" style="transform: rotate({{this.secondRotation}}deg)"></div>
            {{/if}}
            
            <div class="clock-center"></div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Configuration</h4>
        
        <div class="config-panel">
          <div class="config-group">
            <label for="clock-format">Clock Format:</label>
            <select 
              id="clock-format" 
              value={{this.clockFormat}} 
              {{on "change" this.updateClockFormat}}
            >
              <option value="24hour">24-hour</option>
              <option value="12hour">12-hour (AM/PM)</option>
            </select>
          </div>
          
          <div class="config-group">
            <label for="show-seconds">Show Seconds:</label>
            <input 
              type="checkbox" 
              id="show-seconds" 
              checked={{this.showSeconds}} 
              {{on "change" this.toggleShowSeconds}}
            >
          </div>
          
          <div class="config-group">
            <label for="update-interval">Update Interval:</label>
            <select 
              id="update-interval" 
              value={{this.updateInterval}} 
              {{on "change" this.updateInterval}}
            >
              <option value="1000">1 second</option>
              <option value="500">0.5 seconds</option>
              <option value="100">0.1 seconds</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates three key concepts with clock resources:</p>
        
        <ol>
          <li>
            <strong>Resource Creation:</strong> Creating a clock resource that manages its own lifecycle:
            <pre>
const Clock = resource(({ on, use }) => {
  // Get configuration options with defaults
  const updateInterval = use?.args?.named?.updateInterval ?? 1000;
  
  // Create a tracked object to hold the time
  const clock = {
    @tracked time: new Date()
  };
  
  // Update the time at the specified interval
  const intervalId = setInterval(() => {
    clock.time = new Date();
  }, updateInterval);
  
  // Clean up the interval when the resource is destroyed
  on.cleanup(() => {
    clearInterval(intervalId);
  });
  
  return clock;
});
            </pre>
          </li>
          
          <li>
            <strong>Resource Consumption:</strong> Using the clock resource with configuration:
            <pre>
get clock() {
  return Clock({ updateInterval: this.updateInterval });
}
            </pre>
          </li>
          
          <li>
            <strong>Reactive Updates:</strong> The component automatically updates when the time changes:
            <pre>
get formattedTime() {
  const time = this.clock.time;
  
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: this.clockFormat === '12hour'
  };
  
  if (this.showSeconds) {
    options.second = '2-digit';
  }
  
  return time.toLocaleTimeString(undefined, options);
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
      
      .hour-marker {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        text-align: center;
        font-weight: bold;
      }
      
      .hour-marker span {
        display: inline-block;
        width: 24px;
        position: absolute;
        top: 10px;
        left: calc(50% - 12px);
      }
      
      .clock-hand {
        position: absolute;
        bottom: 50%;
        left: 50%;
        transform-origin: bottom center;
        background-color: #333;
        transition: transform 0.1s cubic-bezier(0.4, 2.08, 0.55, 0.44);
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
      
      select, input[type="text"] {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
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
  <h2>Clock Resource in Ember</h2>
  <ClockDemo />
</template>
