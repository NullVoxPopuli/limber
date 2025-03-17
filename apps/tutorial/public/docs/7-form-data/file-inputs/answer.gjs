import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class FileInputDemo extends Component {
  @tracked selectedFiles = [];
  @tracked imagePreview = null;
  @tracked formData = null;
  
  @action
  updateSelectedFiles(event) {
    // Convert the FileList to an array
    this.selectedFiles = Array.from(event.target.files);
  }
  
  @action
  updateImagePreview(event) {
    const file = event.target.files[0];
    
    if (file && file.type.startsWith('image/')) {
      this.readImageFile(file);
    } else {
      this.imagePreview = null;
    }
  }
  
  readImageFile(file) {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      this.imagePreview = event.target.result;
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      this.imagePreview = null;
    };
    
    reader.readAsDataURL(file);
  }
  
  @action
  handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // FormData automatically includes file inputs
    const profilePicture = formData.get('profilePicture');
    const documents = formData.getAll('documents');
    
    // Create a formatted string representation of the form data
    let formDataString = '';
    
    formDataString += `Name: ${formData.get('name')}\n`;
    formDataString += `Email: ${formData.get('email')}\n`;
    
    if (profilePicture && profilePicture.name) {
      formDataString += `Profile Picture: ${profilePicture.name} (${this.formatFileSize(profilePicture.size)})\n`;
    } else {
      formDataString += 'Profile Picture: None\n';
    }
    
    formDataString += 'Documents:\n';
    if (documents.length > 0) {
      documents.forEach((doc, index) => {
        formDataString += `  ${index + 1}. ${doc.name} (${this.formatFileSize(doc.size)})\n`;
      });
    } else {
      formDataString += '  None\n';
    }
    
    this.formData = formDataString;
    console.log('Form submitted:', formData);
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.startsWith('video/')) {
      return '🎬';
    } else if (mimeType.startsWith('audio/')) {
      return '🎵';
    } else if (mimeType.includes('pdf')) {
      return '📄';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return '📝';
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return '📊';
    } else if (mimeType.includes('zip') || mimeType.includes('compressed')) {
      return '🗜️';
    } else {
      return '📁';
    }
  }

  <template>
    <div class="demo-container">
      <h3>File Input Demo</h3>
      
      <div class="section">
        <h4>Basic File Input</h4>
        
        <div class="file-input-container">
          <label for="file-input">Select files:</label>
          
          <input 
            type="file" 
            id="file-input" 
            multiple 
            {{on "change" this.updateSelectedFiles}}
          >
          
          <p class="hint">Select one or more files to see their details</p>
        </div>
        
        <div class="file-list">
          <h5>Selected Files:</h5>
          
          {{#if this.selectedFiles.length}}
            <ul class="file-items">
              {{#each this.selectedFiles as |file|}}
                <li class="file-item">
                  <strong>{{this.getFileIcon file.type}} {{file.name}}</strong>
                  <div class="file-info">
                    Type: {{file.type || "unknown"}} | 
                    Size: {{this.formatFileSize file.size}} | 
                    Last Modified: {{new Date(file.lastModified).toLocaleDateString()}}
                  </div>
                </li>
              {{/each}}
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
          
          <input 
            type="file" 
            id="image-input" 
            accept="image/*" 
            {{on "change" this.updateImagePreview}}
          >
          
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
        
        <form {{on "submit" this.handleFormSubmit}}>
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" class="form-control">
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" class="form-control">
          </div>
          
          <div class="form-group">
            <label for="profile-picture">Profile Picture</label>
            <input 
              type="file" 
              id="profile-picture" 
              name="profilePicture" 
              accept="image/*"
            >
            <p class="hint">Select a profile picture (image files only)</p>
          </div>
          
          <div class="form-group">
            <label for="documents">Documents</label>
            <input 
              type="file" 
              id="documents" 
              name="documents" 
              multiple
            >
            <p class="hint">Select one or more documents</p>
          </div>
          
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
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates three key concepts with file inputs:</p>
        
        <ol>
          <li>
            <strong>Handling File Selection:</strong> The file input uses an event handler to access the selected files:
            <pre>
@action
updateSelectedFiles(event) {
  // Convert the FileList to an array
  this.selectedFiles = Array.from(event.target.files);
}
            </pre>
          </li>
          
          <li>
            <strong>Image Preview:</strong> The image preview uses the FileReader API to read the file content:
            <pre>
readImageFile(file) {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    this.imagePreview = event.target.result;
  };
  
  reader.readAsDataURL(file);
}
            </pre>
          </li>
          
          <li>
            <strong>FormData with Files:</strong> The form submission handler uses FormData to collect the files:
            <pre>
const formData = new FormData(event.target);

// FormData automatically includes file inputs
const profilePicture = formData.get('profilePicture');
const documents = formData.getAll('documents');
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
      
      .file-input-container {
        margin-bottom: 1rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      
      .form-control {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
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
  <h2>File Inputs in Ember</h2>
  <FileInputDemo />
</template>
