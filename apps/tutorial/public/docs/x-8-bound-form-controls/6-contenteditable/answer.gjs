import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

class ContenteditableDemo extends Component {
  // Basic contenteditable
  @tracked basicContent = 'This is editable content. Click to edit me!';
  
  // Rich text editor
  @tracked editorContent = '<p>This is a <strong>rich text</strong> editor. Try using the formatting buttons above!</p>';
  
  get safeBasicContent() {
    return htmlSafe(this.basicContent);
  }
  
  get safeEditorContent() {
    return htmlSafe(this.editorContent);
  }
  
  get plainTextContent() {
    // Create a temporary div to extract text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.editorContent;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  
  get formattedHtmlContent() {
    // Format the HTML for display
    return this.editorContent
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  
  @action
  updateBasicContent(event) {
    this.basicContent = event.target.innerHTML;
  }
  
  @action
  updateEditorContent(event) {
    this.editorContent = event.target.innerHTML;
  }
  
  @action
  formatBold() {
    document.execCommand('bold', false, null);
    // Focus back on the editor
    this.focusEditor();
  }
  
  @action
  formatItalic() {
    document.execCommand('italic', false, null);
    this.focusEditor();
  }
  
  @action
  formatUnderline() {
    document.execCommand('underline', false, null);
    this.focusEditor();
  }
  
  @action
  formatStrikethrough() {
    document.execCommand('strikeThrough', false, null);
    this.focusEditor();
  }
  
  @action
  formatHeading() {
    document.execCommand('formatBlock', false, '<h3>');
    this.focusEditor();
  }
  
  @action
  formatParagraph() {
    document.execCommand('formatBlock', false, '<p>');
    this.focusEditor();
  }
  
  @action
  insertOrderedList() {
    document.execCommand('insertOrderedList', false, null);
    this.focusEditor();
  }
  
  @action
  insertUnorderedList() {
    document.execCommand('insertUnorderedList', false, null);
    this.focusEditor();
  }
  
  @action
  focusEditor() {
    // Get the editor element and focus it
    const editor = document.getElementById('rich-editor');
    if (editor) {
      editor.focus();
    }
  }
  
  @action
  setupEditor(element) {
    // Set initial content
    element.innerHTML = this.editorContent;
  }

  <template>
    <div class="demo-container">
      <h3>Contenteditable Demo</h3>
      
      <div class="section">
        <h4>Basic Contenteditable</h4>
        
        <div class="input-group">
          <label for="basic-contenteditable">Edit this content:</label>
          <div 
            id="basic-contenteditable"
            class="basic-contenteditable"
            contenteditable="true"
            {{on "input" this.updateBasicContent}}
          >
            {{this.safeBasicContent}}
          </div>
          
          <div class="content-display">
            <h5>Content:</h5>
            <div class="content-preview">
              {{this.safeBasicContent}}
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Rich Text Editor</h4>
        
        <div class="editor-container">
          <div class="toolbar">
            <button 
              type="button" 
              class="toolbar-button" 
              title="Bold"
              {{on "click" this.formatBold}}
            >
              <strong>B</strong>
            </button>
            
            <button 
              type="button" 
              class="toolbar-button" 
              title="Italic"
              {{on "click" this.formatItalic}}
            >
              <em>I</em>
            </button>
            
            <button 
              type="button" 
              class="toolbar-button" 
              title="Underline"
              {{on "click" this.formatUnderline}}
            >
              <u>U</u>
            </button>
            
            <button 
              type="button" 
              class="toolbar-button" 
              title="Strikethrough"
              {{on "click" this.formatStrikethrough}}
            >
              <s>S</s>
            </button>
            
            <span class="toolbar-separator"></span>
            
            <button 
              type="button" 
              class="toolbar-button" 
              title="Heading"
              {{on "click" this.formatHeading}}
            >
              H
            </button>
            
            <button 
              type="button" 
              class="toolbar-button" 
              title="Paragraph"
              {{on "click" this.formatParagraph}}
            >
              P
            </button>
            
            <span class="toolbar-separator"></span>
            
            <button 
              type="button" 
              class="toolbar-button" 
              title="Ordered List"
              {{on "click" this.insertOrderedList}}
            >
              OL
            </button>
            
            <button 
              type="button" 
              class="toolbar-button" 
              title="Unordered List"
              {{on "click" this.insertUnorderedList}}
            >
              UL
            </button>
          </div>
          
          <div class="editor-wrapper">
            <div 
              id="rich-editor"
              class="rich-editor"
              contenteditable="true"
              {{on "input" this.updateEditorContent}}
              {{did-insert this.setupEditor}}
            ></div>
          </div>
          
          <div class="content-display">
            <h5>HTML Content:</h5>
            <pre class="html-preview">{{this.formattedHtmlContent}}</pre>
            
            <h5>Plain Text:</h5>
            <div class="text-preview">{{this.plainTextContent}}</div>
          </div>
        </div>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates three key concepts with contenteditable elements:</p>
        
        <ol>
          <li>
            <strong>Controlled Contenteditable:</strong> The contenteditable element's content is controlled by a tracked property:
            <pre>
@tracked basicContent = 'This is editable content.';

@action
updateBasicContent(event) {
  this.basicContent = event.target.innerHTML;
}
            </pre>
          </li>
          
          <li>
            <strong>Rich Text Formatting:</strong> The editor uses document.execCommand for formatting:
            <pre>
@action
formatBold() {
  document.execCommand('bold', false, null);
  // Focus back on the editor
  this.focusEditor();
}
            </pre>
          </li>
          
          <li>
            <strong>Content Extraction:</strong> The component extracts plain text from HTML content:
            <pre>
get plainTextContent() {
  // Create a temporary div to extract text content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = this.editorContent;
  return tempDiv.textContent || tempDiv.innerText || '';
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
      
      .basic-contenteditable {
        margin-bottom: 1rem;
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
        flex-wrap: wrap;
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
        min-width: 2rem;
        text-align: center;
      }
      
      .toolbar-button:hover {
        background-color: #f1f1f1;
      }
      
      .toolbar-button.active {
        background-color: #e6e6e6;
        border-color: #999;
      }
      
      .toolbar-separator {
        width: 1px;
        background-color: #ccc;
        margin: 0 0.25rem;
      }
      
      .editor-wrapper {
        margin-bottom: 1rem;
      }
      
      .rich-editor {
        border: 1px solid #ccc;
        border-top: none;
        border-radius: 0 0 4px 4px;
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
  <h2>Contenteditable Elements in Ember</h2>
  <ContenteditableDemo />
</template>
