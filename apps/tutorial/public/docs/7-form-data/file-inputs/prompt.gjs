import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class FileInputDemo extends Component {
  @tracked selectedFiles = [];
  @tracked imagePreview = null;
  @tracked formData = null;
  
  // TODO: Implement the update handler for the file input
  
  // TODO: Implement a method to read and preview image files
  
  // TODO: Implement the form submission handler
  
  <template>
    <div class="demo-container">
      <h3>File Input Demo</h3>
      
      <div class="section">
        <h4>Basic File Input</h4>
        
        <div class="file-input-container">
          <label for="file-input">Select files:</label>
          
          {{! TODO: Add a file input that updates the selectedFiles state }}
          
          <p class="hint">Select one or more files to see their details</p>
        </div>
        
        <div class="file-list">
          <h5>Selected Files:</h5>
          
          {{#if this.selectedFiles.length}}
            <ul class="file-items">
              {{! TODO: Display information about each selected file }}
            </ul>
          {{else}}
            <p class="empty-message">No files selected</p>
          {{/if}}
        </div>
      </div>
      
      <div class="section">
        <h4>Image Preview</h4>
        
        <div class="file-input-container">
          <label for="image-input">Select an image:</label>
          
          {{! TODO: Add a file input that only accepts images and shows a preview }}
          
          <p class="hint">Select an image file to see a preview</p>
        </div>
        
        <div class="image-preview">
          {{#if this.imagePreview}}
            <img src={{this.imagePreview}} alt="Preview" class="preview-image">
          {{else}}
            <div class="empty-preview">Image preview will appear here</div>
          {{/if}}
        </div>
      </div>
      
      <div class="section">
        <h4>Form Data Example</h4>
        
        <form>
          {{! TODO: Add a form with file inputs that uses FormData }}
          
          <button type="submit">Submit</button>
        </form>
        
        <div class="result">
          {{#if this.formData}}
            <p>Form data:</p>
            <pre>{{this.formData}}</pre>
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
      
      .file-input-container {
        margin-bottom: 1rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      
      .hint {
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: #666;
        font-style: italic;
      }
      
      .file-list {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .file-items {
        margin: 0;
        padding-left: 1.5rem;
      }
      
      .file-item {
        margin-bottom: 0.5rem;
      }
      
      .file-info {
        font-size: 0.875rem;
        color: #666;
      }
      
      .image-preview {
        margin-top: 1rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        text-align: center;
      }
      
      .preview-image {
        max-width: 100%;
        max-height: 200px;
        border-radius: 4px;
      }
      
      .empty-preview {
        padding: 2rem;
        color: #999;
        font-style: italic;
        border: 2px dashed #ddd;
        border-radius: 4px;
      }
      
      .form-group {
        margin-bottom: 1rem;
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
      
      .empty-message {
        color: #999;
        font-style: italic;
      }
    </style>
  </template>
}

<template>
  <h2>File Inputs in Ember</h2>
  <FileInputDemo />
</template>
