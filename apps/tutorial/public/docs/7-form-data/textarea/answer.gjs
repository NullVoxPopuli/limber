import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { modifier } from 'ember-modifier';

class TextareaDemo extends Component {
  @tracked content = '';
  @tracked formData = null;
  @tracked characterCount = 0;
  @tracked autoResizeContent = '';
  
  maxLength = 280; // Maximum character limit
  
  @action
  updateContent(event) {
    const value = event.target.value;
    
    // Enforce the character limit
    if (value.length <= this.maxLength) {
      this.content = value;
      this.characterCount = value.length;
    } else {
      // If the user tries to paste text that exceeds the limit, truncate it
      this.content = value.slice(0, this.maxLength);
      this.characterCount = this.maxLength;
      event.target.value = this.content;
    }
  }
  
  @action
  updateAutoResizeContent(event) {
    this.autoResizeContent = event.target.value;
  }
  
  // Modifier for auto-resizing the textarea
  autoResize = modifier((element) => {
    // Set the initial height
    this.adjustHeight(element);
    
    // Add an input event listener to adjust height as the user types
    const handleInput = () => {
      this.adjustHeight(element);
    };
    
    element.addEventListener('input', handleInput);
    
    // Return a cleanup function
    return () => {
      element.removeEventListener('input', handleInput);
    };
  });
  
  adjustHeight(element) {
    // Reset the height to auto to get the correct scrollHeight
    element.style.height = 'auto';
    // Set the height to the scrollHeight to fit the content
    element.style.height = `${element.scrollHeight}px`;
  }
  
  @action
  handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    this.formData = data;
    console.log('Form submitted:', this.formData);
  }
  
  get remainingCharacters() {
    return this.maxLength - this.characterCount;
  }

  <template>
    <div class="demo-container">
      <h3>Textarea Demo</h3>
      
      <div class="section">
        <h4>Controlled Textarea</h4>
        
        <div class="textarea-container">
          <label for="controlled-textarea">Enter your comment:</label>
          
          <textarea
            id="controlled-textarea"
            value={{this.content}}
            placeholder="Type your comment here..."
            rows="4"
            maxlength={{this.maxLength}}
            {{on "input" this.updateContent}}
          ></textarea>
          
          <div class="character-count {{if (lt this.remainingCharacters 20) 'warning'}}">
            {{this.characterCount}} / {{this.maxLength}} characters
            ({{this.remainingCharacters}} remaining)
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
          
          <textarea
            id="auto-resize-textarea"
            value={{this.autoResizeContent}}
            placeholder="Type or paste content here to see the textarea grow..."
            class="auto-resize"
            {{this.autoResize}}
            {{on "input" this.updateAutoResizeContent}}
          ></textarea>
          
          <p class="hint">This textarea will grow as you type more content</p>
        </div>
      </div>
      
      <div class="section">
        <h4>Form Data Example</h4>
        
        <form {{on "submit" this.handleFormSubmit}}>
          <div class="form-group">
            <label for="form-textarea">Your feedback:</label>
            <textarea
              id="form-textarea"
              name="feedback"
              placeholder="Please provide your feedback..."
              rows="4"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="form-name">Your name:</label>
            <input
              type="text"
              id="form-name"
              name="name"
              placeholder="Your name"
            >
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
        <p>This component demonstrates three key concepts with textareas:</p>
        
        <ol>
          <li>
            <strong>Controlled Textarea:</strong> The comment textarea uses a tracked property and an event handler to maintain its state:
            <pre>
@tracked content = '';

@action
updateContent(event) {
  const value = event.target.value;
  
  if (value.length <= this.maxLength) {
    this.content = value;
    this.characterCount = value.length;
  }
}
            </pre>
          </li>
          
          <li>
            <strong>Auto-resizing Textarea:</strong> The second textarea uses a modifier to adjust its height based on content:
            <pre>
autoResize = modifier((element) => {
  const adjustHeight = () => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };
  
  element.addEventListener('input', adjustHeight);
  
  return () => {
    element.removeEventListener('input', adjustHeight);
  };
});
            </pre>
          </li>
          
          <li>
            <strong>FormData API:</strong> The form example uses FormData to collect values:
            <pre>
const formData = new FormData(event.target);
const data = Object.fromEntries(formData.entries());

// data.feedback will contain the textarea content
console.log(data.feedback);
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
      
      .auto-resize {
        min-height: 3rem;
        overflow-y: hidden;
        resize: none;
      }
      
      .character-count {
        margin-top: 0.25rem;
        text-align: right;
        font-size: 0.875rem;
        color: #666;
      }
      
      .character-count.warning {
        color: #e74c3c;
        font-weight: bold;
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
      
      pre {
        margin: 0;
        white-space: pre-wrap;
        background-color: #f1f1f1;
        padding: 0.5rem;
        border-radius: 4px;
        overflow-x: auto;
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
  <h2>Textareas in Ember</h2>
  <TextareaDemo />
</template>
