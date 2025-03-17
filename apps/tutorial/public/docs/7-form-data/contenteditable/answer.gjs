import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { modifier } from 'ember-modifier';
import { htmlSafe } from '@ember/template';

class ContenteditableDemo extends Component {
  @tracked content = '<p>This is editable content. Try formatting it!</p>';
  @tracked formData = null;
  
  @action
  updateContent(event) {
    this.content = event.target.innerHTML;
  }
  
  @action
  formatText(command) {
    document.execCommand(command, false, null);
  }
  
  @action
  handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // Add the contenteditable content to the form data
    formData.append('richContent', this.content);
    
    const data = Object.fromEntries(formData.entries());
    this.formData = data;
    
    console.log('Form submitted:', this.formData);
  }
  
  // Modifier to set initial content and focus the editor
  contentEditableModifier = modifier((element) => {
    // Set initial content
    element.innerHTML = this.content;
    
    // Focus the editor when it's first rendered
    setTimeout(() => {
      element.focus();
    }, 100);
  });
  
  get safeContent() {
    return htmlSafe(this.content);
  }

  <template>
    <div class="demo-container">
      <h3>Contenteditable Demo</h3>
      
      <div class="section">
        <h4>Rich Text Editor</h4>
        
        <div class="toolbar">
          <button 
            type="button" 
            class="toolbar-button" 
            title="Bold"
            {{on "click" (fn this.formatText "bold")}}
          >
            <strong>B</strong>
          </button>
          
          <button 
            type="button" 
            class="toolbar-button" 
            title="Italic"
            {{on "click" (fn this.formatText "italic")}}
          >
            <em>I</em>
          </button>
          
          <button 
            type="button" 
            class="toolbar-button" 
            title="Underline"
            {{on "click" (fn this.formatText "underline")}}
          >
            <u>U</u>
          </button>
        </div>
        
        <div class="editor-container">
          <div 
            class="rich-editor" 
            contenteditable="true"
            {{this.contentEditableModifier}}
            {{on "input" this.updateContent}}
          ></div>
        </div>
        
        <div class="content-preview">
          <h5>HTML Preview:</h5>
          <pre>{{this.content}}</pre>
        </div>
      </div>
      
      <div class="section">
        <h4>Form Integration</h4>
        
        <form {{on "submit" this.handleFormSubmit}}>
          <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" name="title" class="form-control">
          </div>
          
          <div class="form-group">
            <label for="author">Author</label>
            <input type="text" id="author" name="author" class="form-control">
          </div>
          
          <div class="form-group">
            <label>Content (from rich editor above)</label>
            <div class="content-display">
              {{this.safeContent}}
            </div>
            <p class="hint">This content will be included in the form submission</p>
          </div>
          
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
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates three key concepts with contenteditable elements:</p>
        
        <ol>
          <li>
            <strong>Controlled Contenteditable:</strong> The rich editor uses a tracked property and an event handler to maintain its state:
            <pre>
@tracked content = '&lt;p&gt;Initial content&lt;/p&gt;';

@action
updateContent(event) {
  this.content = event.target.innerHTML;
}
            </pre>
          </li>
          
          <li>
            <strong>Text Formatting:</strong> The toolbar buttons use document.execCommand to apply formatting:
            <pre>
@action
formatText(command) {
  document.execCommand(command, false, null);
}
            </pre>
          </li>
          
          <li>
            <strong>Form Integration:</strong> The form example manually adds the contenteditable content to the FormData:
            <pre>
const formData = new FormData(event.target);

// Add the contenteditable content to the form data
formData.append('richContent', this.content);

const data = Object.fromEntries(formData.entries());
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
        background-color: #f1f1f1;
        padding: 0.5rem;
        border-radius: 4px;
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
      
      .content-display {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: #fff;
        min-height: 100px;
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
      
      .explanation {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
    </style>
  </template>
}

<template>
  <h2>Contenteditable in Ember</h2>
  <ContenteditableDemo />
</template>
