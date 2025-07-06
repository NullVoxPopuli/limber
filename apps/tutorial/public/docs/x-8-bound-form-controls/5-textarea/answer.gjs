import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

class TextareaInputDemo extends Component {
  // Basic textarea
  @tracked basicContent = 'This is a basic textarea.';
  
  // Formatted textarea
  @tracked formattedContent = 'This is a formatted textarea.\n\nIt preserves line breaks and formatting.\n\nTry adding more content!';
  
  // Auto-resizing textarea
  @tracked autoResizeContent = 'This textarea will automatically resize as you add more content.\n\nTry adding more lines to see it in action!';
  
  // Limited textarea
  @tracked limitedContent = '';
  @tracked maxLength = 200;
  
  get formattedPreview() {
    // Replace line breaks with HTML line breaks for display
    // Use htmlSafe to mark the string as safe HTML
    return htmlSafe(this.formattedContent.replace(/\n/g, '<br>'));
  }
  
  get characterCount() {
    return this.limitedContent.length;
  }
  
  get remainingCharacters() {
    return this.maxLength - this.characterCount;
  }
  
  get counterClass() {
    if (this.remainingCharacters <= 10) {
      return 'danger';
    } else if (this.remainingCharacters <= 30) {
      return 'warning';
    }
    return '';
  }
  
  get borderColor() {
    if (this.remainingCharacters <= 10) {
      return '#e74c3c';
    } else if (this.remainingCharacters <= 30) {
      return '#f39c12';
    }
    return '#ccc';
  }
  
  @action
  updateBasicContent(event) {
    this.basicContent = event.target.value;
  }
  
  @action
  updateFormattedContent(event) {
    this.formattedContent = event.target.value;
  }
  
  @action
  updateAutoResizeContent(event) {
    this.autoResizeContent = event.target.value;
    this.adjustHeight(event.target);
  }
  
  @action
  updateLimitedContent(event) {
    const value = event.target.value;
    
    // Enforce the character limit
    if (value.length <= this.maxLength) {
      this.limitedContent = value;
    } else {
      // Truncate the input if it exceeds the limit
      this.limitedContent = value.slice(0, this.maxLength);
      event.target.value = this.limitedContent;
    }
  }
  
  @action
  adjustHeight(element) {
    // Reset height to auto to get the correct scrollHeight
    element.style.height = 'auto';
    // Set the height to match the content
    element.style.height = `${element.scrollHeight}px`;
  }
  
  @action
  setupAutoResize(element) {
    // Initial height adjustment
    this.adjustHeight(element);
  }

  <template>
    <div class="demo-container">
      <h3>Textarea Input Demo</h3>
      
      <div class="section">
        <h4>Basic Textarea</h4>
        
        <div class="input-group">
          <label for="basic-textarea">Enter some text:</label>
          <textarea 
            id="basic-textarea" 
            value={{this.basicContent}} 
            {{on "input" this.updateBasicContent}}
            rows="4"
            placeholder="Enter your text here"
          ></textarea>
          
          <div class="content-display">
            <h5>Content:</h5>
            <div class="content-preview">
              {{this.basicContent}}
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Formatted Preview</h4>
        
        <div class="input-group">
          <label for="formatted-textarea">Enter formatted text:</label>
          <textarea 
            id="formatted-textarea" 
            value={{this.formattedContent}} 
            {{on "input" this.updateFormattedContent}}
            rows="6"
            placeholder="Enter text with line breaks and formatting"
          ></textarea>
          <p class="hint">Try adding line breaks and formatting</p>
          
          <div class="content-display">
            <h5>Preview:</h5>
            <div class="formatted-preview">
              {{this.formattedPreview}}
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h4>Auto-resizing Textarea</h4>
        
        <div class="input-group">
          <label for="auto-resize-textarea">Auto-resizing textarea:</label>
          <textarea 
            id="auto-resize-textarea" 
            class="auto-resize"
            value={{this.autoResizeContent}} 
            {{on "input" this.updateAutoResizeContent}}
            {{did-insert this.setupAutoResize}}
            placeholder="This textarea will grow as you type"
          ></textarea>
          <p class="hint">The textarea will grow as you type</p>
        </div>
      </div>
      
      <div class="section">
        <h4>Character Counter</h4>
        
        <div class="input-group">
          <label for="limited-textarea">Limited textarea (max 200 characters):</label>
          <textarea 
            id="limited-textarea" 
            class="limited"
            value={{this.limitedContent}} 
            {{on "input" this.updateLimitedContent}}
            rows="4"
            placeholder="Start typing to see the character counter in action"
            style="border-color: {{this.borderColor}};"
          ></textarea>
          
          <div class="counter-display">
            <span class="counter {{this.counterClass}}">
              {{this.characterCount}} / {{this.maxLength}}
            </span>
            <span class="remaining">
              ({{this.remainingCharacters}} characters remaining)
            </span>
          </div>
        </div>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates four key concepts with textarea inputs:</p>
        
        <ol>
          <li>
            <strong>Controlled Textarea:</strong> The textarea's value is controlled by a tracked property:
            <pre>
@tracked basicContent = 'This is a basic textarea.';

@action
updateBasicContent(event) {
  this.basicContent = event.target.value;
}
            </pre>
          </li>
          
          <li>
            <strong>Formatted Preview:</strong> Line breaks are preserved in the preview:
            <pre>
get formattedPreview() {
  // Replace line breaks with HTML line breaks for display
  // Use htmlSafe to mark the string as safe HTML
  return htmlSafe(this.formattedContent.replace(/\n/g, '<br>'));
}
            </pre>
          </li>
          
          <li>
            <strong>Auto-resizing:</strong> The textarea adjusts its height based on content:
            <pre>
@action
adjustHeight(element) {
  // Reset height to auto to get the correct scrollHeight
  element.style.height = 'auto';
  // Set the height to match the content
  element.style.height = `${element.scrollHeight}px`;
}

@action
updateAutoResizeContent(event) {
  this.autoResizeContent = event.target.value;
  this.adjustHeight(event.target);
}
            </pre>
          </li>
          
          <li>
            <strong>Character Counter:</strong> The textarea enforces a character limit:
            <pre>
@action
updateLimitedContent(event) {
  const value = event.target.value;
  
  // Enforce the character limit
  if (value.length <= this.maxLength) {
    this.limitedContent = value;
  } else {
    // Truncate the input if it exceeds the limit
    this.limitedContent = value.slice(0, this.maxLength);
    event.target.value = this.limitedContent;
  }
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
        min-height: 100px;
      }
      
      textarea.limited {
        transition: border-color 0.3s;
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
        white-space: pre-wrap;
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
      
      .remaining {
        color: #666;
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
  <h2>Textarea Inputs in Ember</h2>
  <TextareaInputDemo />
</template>
