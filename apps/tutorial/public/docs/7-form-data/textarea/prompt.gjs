import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { modifier } from 'ember-modifier';

class TextareaDemo extends Component {
  @tracked content = '';
  @tracked formData = null;
  @tracked characterCount = 0;
  
  maxLength = 280; // Maximum character limit
  
  // TODO: Implement the update handler for the textarea
  
  // TODO: Implement a modifier for auto-resizing the textarea
  
  // TODO: Implement the form submission handler
  
  <template>
    <div class="demo-container">
      <h3>Textarea Demo</h3>
      
      <div class="section">
        <h4>Controlled Textarea</h4>
        
        <div class="textarea-container">
          <label for="controlled-textarea">Enter your comment:</label>
          
          {{! TODO: Add a controlled textarea }}
          
          <div class="character-count">
            {{! TODO: Add character count display }}
          </div>
        </div>
        
        <div class="content-preview">
          <h5>Preview:</h5>
          {{#if this.content}}
            <div class="preview-content">{{this.content}}</div>
          {{else}}
            <div class="empty-preview">Your comment will appear here</div>
          {{/if}}
        </div>
      </div>
      
      <div class="section">
        <h4>Auto-resizing Textarea</h4>
        
        <div class="textarea-container">
          <label for="auto-resize-textarea">Auto-resizing textarea:</label>
          
          {{! TODO: Add an auto-resizing textarea }}
          
          <p class="hint">This textarea will grow as you type more content</p>
        </div>
      </div>
      
      <div class="section">
        <h4>Form Data Example</h4>
        
        <form>
          {{! TODO: Add a form with a textarea that uses FormData }}
          
          <button type="submit">Submit</button>
        </form>
        
        <div class="result">
          {{#if this.formData}}
            <p>Form data:</p>
            <pre>{{JSON.stringify this.formData null 2}}</pre>
          {{else}}
            <p>Form data will appear here after submission</p>
          {{/if}}
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
      
      .textarea-container {
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
        line-height: 1.5;
      }
      
      .character-count {
        margin-top: 0.25rem;
        text-align: right;
        font-size: 0.875rem;
        color: #666;
      }
      
      .content-preview {
        margin-top: 1rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .preview-content {
        white-space: pre-wrap;
      }
      
      .empty-preview {
        color: #999;
        font-style: italic;
      }
      
      .hint {
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: #666;
        font-style: italic;
      }
      
      .result {
        margin-top: 1rem;
        padding: 0.5rem;
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
      }
      
      pre {
        margin: 0;
        white-space: pre-wrap;
      }
    </style>
  </template>
}

<template>
  <h2>Textareas in Ember</h2>
  <TextareaDemo />
</template>
