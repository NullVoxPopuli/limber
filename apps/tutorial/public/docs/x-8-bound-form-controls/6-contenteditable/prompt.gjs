import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

class ContenteditableDemo extends Component {
  // TODO: Add tracked properties for contenteditable content
  
  // TODO: Add computed properties for formatted content
  
  // TODO: Implement update handlers
  
  // TODO: Implement formatting actions
  
  <template>
    <div class="demo-container">
      <h3>Contenteditable Demo</h3>
      
      <div class="section">
        <h4>Basic Contenteditable</h4>
        
        <div class="input-group">
          <label for="basic-contenteditable">Edit this content:</label>
          {{! TODO: Add a controlled contenteditable element }}
          
          <div class="content-display">
            <h5>Content:</h5>
            <div class="content-preview">
              {{! TODO: Display the contenteditable content }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Rich Text Editor</h4>
        
        <div class="editor-container">
          <div class="toolbar">
            {{! TODO: Add formatting buttons }}
          </div>
          
          <div class="editor-wrapper">
            {{! TODO: Add a rich text editor contenteditable element }}
          </div>
          
          <div class="content-display">
            <h5>HTML Content:</h5>
            <pre class="html-preview">
              {{! TODO: Display the HTML content }}
            </pre>
            
            <h5>Plain Text:</h5>
            <div class="text-preview">
              {{! TODO: Display the plain text content }}
            </div>
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
      
      [contenteditable] {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        min-height: 100px;
        background-color: white;
      }
      
      [contenteditable]:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
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
      
      .editor-container {
        margin-bottom: 1rem;
      }
      
      .toolbar {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        background-color: #f8f9fa;
        border: 1px solid #ccc;
        border-radius: 4px 4px 0 0;
      }
      
      .toolbar-button {
        padding: 0.25rem 0.5rem;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .toolbar-button:hover {
        background-color: #f1f1f1;
      }
      
      .toolbar-button.active {
        background-color: #e6e6e6;
        border-color: #999;
      }
      
      .editor-wrapper {
        margin-bottom: 1rem;
      }
      
      .html-preview {
        padding: 0.5rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.875rem;
        white-space: pre-wrap;
        overflow-x: auto;
      }
      
      .text-preview {
        padding: 0.5rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        min-height: 3rem;
      }
    </style>
  </template>
}

<template>
  <h2>Contenteditable Elements in Ember</h2>
  <ContenteditableDemo />
</template>
