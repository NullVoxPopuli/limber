import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { modifier } from 'ember-modifier';

class ContenteditableDemo extends Component {
  @tracked content = '<p>This is editable content. Try formatting it!</p>';
  @tracked formData = null;
  
  // TODO: Implement the update handler for the contenteditable element
  
  // TODO: Implement formatting actions (bold, italic, underline)
  
  // TODO: Implement the form submission handler
  
  <template>
    <div class="demo-container">
      <h3>Contenteditable Demo</h3>
      
      <div class="section">
        <h4>Rich Text Editor</h4>
        
        <div class="toolbar">
          {{! TODO: Add formatting buttons }}
        </div>
        
        <div class="editor-container">
          {{! TODO: Add a contenteditable element }}
        </div>
        
        <div class="content-preview">
          <h5>HTML Preview:</h5>
          <pre>{{this.content}}</pre>
        </div>
      </div>
      
      <div class="section">
        <h4>Form Integration</h4>
        
        <form>
          {{! TODO: Add a form with regular inputs and contenteditable integration }}
          
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
      
      .toolbar {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border: 1px solid #ccc;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
      }
      
      .toolbar-button {
        padding: 0.25rem 0.5rem;
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .toolbar-button:hover {
        background-color: #f1f1f1;
      }
      
      .editor-container {
        margin-bottom: 1rem;
      }
      
      .rich-editor {
        min-height: 150px;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 0 0 4px 4px;
        overflow-y: auto;
      }
      
      .rich-editor:focus {
        outline: none;
        border-color: #3498db;
      }
      
      .content-preview {
        margin-top: 1rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      pre {
        margin: 0;
        white-space: pre-wrap;
        overflow-x: auto;
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      
      input[type="text"] {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
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
    </style>
  </template>
}

<template>
  <h2>Contenteditable in Ember</h2>
  <ContenteditableDemo />
</template>
