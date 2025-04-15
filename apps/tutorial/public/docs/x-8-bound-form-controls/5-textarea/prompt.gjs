import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

class TextareaInputDemo extends Component {
  // TODO: Add tracked properties for textarea content
  
  // TODO: Add computed properties for formatted content
  
  // TODO: Implement update handlers
  
  // TODO: Implement auto-resize functionality
  
  <template>
    <div class="demo-container">
      <h3>Textarea Input Demo</h3>
      
      <div class="section">
        <h4>Basic Textarea</h4>
        
        <div class="input-group">
          <label for="basic-textarea">Enter some text:</label>
          {{! TODO: Add a controlled textarea input }}
          
          <div class="content-display">
            <h5>Content:</h5>
            <div class="content-preview">
              {{! TODO: Display the textarea content }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Formatted Preview</h4>
        
        <div class="input-group">
          <label for="formatted-textarea">Enter formatted text:</label>
          {{! TODO: Add a textarea for formatted content }}
          <p class="hint">Try adding line breaks and formatting</p>
          
          <div class="content-display">
            <h5>Preview:</h5>
            <div class="formatted-preview">
              {{! TODO: Display the formatted content with preserved formatting }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Auto-resizing Textarea</h4>
        
        <div class="input-group">
          <label for="auto-resize-textarea">Auto-resizing textarea:</label>
          {{! TODO: Add an auto-resizing textarea }}
          <p class="hint">The textarea will grow as you type</p>
        </div>
      </div>
      
      <div class="section">
        <h4>Character Counter</h4>
        
        <div class="input-group">
          <label for="limited-textarea">Limited textarea (max 200 characters):</label>
          {{! TODO: Add a textarea with character counter }}
          
          <div class="counter-display">
            {{! TODO: Display character count and limit }}
          </div>
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
      
      .input-group {
        margin-bottom: 1rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      
      textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-family: inherit;
        font-size: inherit;
        resize: vertical;
      }
      
      textarea.auto-resize {
        resize: none;
        overflow: hidden;
      }
      
      textarea.limited {
        border-color: var(--border-color, #ccc);
      }
      
      .hint {
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: #666;
        font-style: italic;
      }
      
      .content-display {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .content-display h5 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      
      .content-preview {
        padding: 0.5rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        min-height: 3rem;
      }
      
      .formatted-preview {
        padding: 0.5rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        min-height: 3rem;
      }
      
      .counter-display {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        text-align: right;
      }
      
      .counter {
        font-weight: bold;
      }
      
      .counter.warning {
        color: #f39c12;
      }
      
      .counter.danger {
        color: #e74c3c;
      }
    </style>
  </template>
}

<template>
  <h2>Textarea Inputs in Ember</h2>
  <TextareaInputDemo />
</template>
