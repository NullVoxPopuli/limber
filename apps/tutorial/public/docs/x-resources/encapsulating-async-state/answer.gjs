import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { resource } from 'ember-resources';

// Async data resource that encapsulates the state of an async operation
const AsyncData = resource(({ on, use }) => {
  // Get configuration options with defaults
  const endpoint = use?.args?.named?.endpoint ?? 'success';
  const delay = use?.args?.named?.delay ?? 1500;
  
  // Create a tracked object to hold the state
  const state = {
    @tracked data: null,
    @tracked isLoading: true,
    @tracked error: null,
    
    async fetchData() {
      state.isLoading = true;
      state.error = null;
      
      try {
        // Simulate API call with different scenarios
        const data = await simulateApiCall(endpoint, delay);
        state.data = data;
      } catch (error) {
        state.error = error;
      } finally {
        state.isLoading = false;
      }
    }
  };
  
  // Simulate an API call with different scenarios
  async function simulateApiCall(endpoint, delay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (endpoint === 'success') {
          resolve([
            { id: 1, name: 'Item 1', description: 'This is the first item' },
            { id: 2, name: 'Item 2', description: 'This is the second item' },
            { id: 3, name: 'Item 3', description: 'This is the third item' }
          ]);
        } else if (endpoint === 'empty') {
          resolve([]);
        } else if (endpoint === 'error') {
          reject(new Error('Failed to fetch data'));
        } else if (endpoint === 'network-error') {
          reject(new Error('Network error: Unable to connect to server'));
        } else {
          reject(new Error('Unknown endpoint'));
        }
      }, delay);
    });
  }
  
  // Initial fetch
  state.fetchData();
  
  // Clean up if needed
  on.cleanup(() => {
    // Any cleanup logic here
  });
  
  return state;
});

// Custom async operation hook
function useAsyncOperation() {
  return {
    @tracked isLoading: false,
    @tracked result: null,
    @tracked error: null,
    
    async execute(operation, delay = 1000, shouldSucceed = true) {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Simulate an async operation
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (!shouldSucceed) {
          throw new Error(`Operation "${operation}" failed`);
        }
        
        this.result = `Operation "${operation}" completed successfully at ${new Date().toLocaleTimeString()}`;
        return this.result;
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  };
}

class AsyncStateDemo extends Component {
  // Configuration for the async data resource
  @tracked endpoint = 'success';
  @tracked delay = 1500;
  
  // Use the async data resource
  get asyncData() {
    return AsyncData({ 
      endpoint: this.endpoint,
      delay: this.delay
    });
  }
  
  // Custom async operation
  asyncOperation = useAsyncOperation();
  
  // Configuration for the custom operation
  @tracked operationName = 'Save Data';
  @tracked operationDelay = 1000;
  @tracked operationShouldSucceed = true;
  
  @action
  fetchSuccess() {
    this.endpoint = 'success';
    this.asyncData.fetchData();
  }
  
  @action
  fetchEmpty() {
    this.endpoint = 'empty';
    this.asyncData.fetchData();
  }
  
  @action
  fetchError() {
    this.endpoint = 'error';
    this.asyncData.fetchData();
  }
  
  @action
  fetchNetworkError() {
    this.endpoint = 'network-error';
    this.asyncData.fetchData();
  }
  
  @action
  async executeOperation() {
    try {
      await this.asyncOperation.execute(
        this.operationName,
        this.operationDelay,
        this.operationShouldSucceed
      );
    } catch (error) {
      // Error is already captured in the asyncOperation state
      console.error('Operation failed:', error);
    }
  }
  
  @action
  toggleOperationSuccess() {
    this.operationShouldSucceed = !this.operationShouldSucceed;
  }

  <template>
    <div class="demo-container">
      <h3>Encapsulating Async State Demo</h3>
      
      <div class="section">
        <h4>Async Data Fetching</h4>
        
        <div class="controls">
          <button {{on "click" this.fetchSuccess}}>
            Fetch Success
          </button>
          
          <button {{on "click" this.fetchEmpty}}>
            Fetch Empty
          </button>
          
          <button {{on "click" this.fetchError}} class="error">
            Fetch Error
          </button>
          
          <button {{on "click" this.fetchNetworkError}} class="error">
            Network Error
          </button>
        </div>
        
        <div class="data-display">
          {{#if this.asyncData.isLoading}}
            <div class="loading">
              <div class="spinner"></div>
              <p>Loading data...</p>
            </div>
          {{else if this.asyncData.error}}
            <div class="error-display">
              <h5>Error</h5>
              <p>{{this.asyncData.error.message}}</p>
              <button {{on "click" this.asyncData.fetchData}} class="retry">
                Retry
              </button>
            </div>
          {{else if this.asyncData.data.length}}
            <div class="data-list">
              <h5>Data Items</h5>
              {{#each this.asyncData.data as |item|}}
                <div class="data-item">
                  <h6>{{item.name}}</h6>
                  <p>{{item.description}}</p>
                </div>
              {{/each}}
            </div>
          {{else}}
            <div class="empty-state">
              <h5>No Data</h5>
              <p>No items were found.</p>
            </div>
          {{/if}}
        </div>
      </div>
      
      <div class="section">
        <h4>Async Operation with Retry</h4>
        
        <div class="operation-panel">
          <div class="operation-config">
            <div class="config-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={{this.operationShouldSucceed}} 
                  {{on "change" this.toggleOperationSuccess}}
                >
                Operation should succeed
              </label>
            </div>
          </div>
          
          <div class="operation-controls">
            <button 
              {{on "click" this.executeOperation}}
              disabled={{this.asyncOperation.isLoading}}
            >
              {{if this.asyncOperation.isLoading "Processing..." "Execute Operation"}}
            </button>
          </div>
          
          <div class="operation-result">
            {{#if this.asyncOperation.isLoading}}
              <div class="loading">
                <div class="spinner"></div>
                <p>Operation in progress...</p>
              </div>
            {{else if this.asyncOperation.error}}
              <div class="error-display">
                <h5>Operation Failed</h5>
                <p>{{this.asyncOperation.error.message}}</p>
                <button {{on "click" this.executeOperation}} class="retry">
                  Retry Operation
                </button>
              </div>
            {{else if this.asyncOperation.result}}
              <div class="success-display">
                <h5>Operation Successful</h5>
                <p>{{this.asyncOperation.result}}</p>
              </div>
            {{else}}
              <p class="instruction">Click the button to execute an async operation.</p>
            {{/if}}
          </div>
        </div>
      </div>
      
      <div class="explanation">
        <h4>How It Works</h4>
        <p>This component demonstrates two key patterns for encapsulating async state:</p>
        
        <ol>
          <li>
            <strong>Async Data Resource:</strong> A resource that encapsulates the state of an async data fetching operation:
            <pre>
const AsyncData = resource(({ on, use }) => {
  // Configuration options
  const endpoint = use?.args?.named?.endpoint ?? 'success';
  
  // State object with tracked properties
  const state = {
    @tracked data: null,
    @tracked isLoading: true,
    @tracked error: null,
    
    async fetchData() {
      state.isLoading = true;
      state.error = null;
      
      try {
        const data = await simulateApiCall(endpoint);
        state.data = data;
      } catch (error) {
        state.error = error;
      } finally {
        state.isLoading = false;
      }
    }
  };
  
  // Initial fetch
  state.fetchData();
  
  return state;
});
            </pre>
          </li>
          
          <li>
            <strong>Custom Async Operation Hook:</strong> A reusable hook for encapsulating any async operation:
            <pre>
function useAsyncOperation() {
  return {
    @tracked isLoading: false,
    @tracked result: null,
    @tracked error: null,
    
    async execute(operation, delay = 1000, shouldSucceed = true) {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Simulate an async operation
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (!shouldSucceed) {
          throw new Error(`Operation "${operation}" failed`);
        }
        
        this.result = `Operation "${operation}" completed successfully`;
        return this.result;
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  };
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
      
      .controls {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      
      button {
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      button:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
      }
      
      button.retry {
        background-color: #2ecc71;
      }
      
      button.error {
        background-color: #e74c3c;
      }
      
      .data-display {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        min-height: 200px;
      }
      
      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 150px;
        gap: 1rem;
      }
      
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-left-color: #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .error-display {
        padding: 1rem;
        background-color: #ffebee;
        border-left: 4px solid #e74c3c;
        border-radius: 4px;
      }
      
      .success-display {
        padding: 1rem;
        background-color: #e8f5e9;
        border-left: 4px solid #2ecc71;
        border-radius: 4px;
      }
      
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 150px;
        color: #7f8c8d;
      }
      
      .data-item {
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .data-item h6 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      
      .data-item p {
        margin: 0;
      }
      
      .operation-panel {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .operation-config {
        margin-bottom: 1rem;
      }
      
      .config-group {
        margin-bottom: 0.5rem;
      }
      
      .operation-controls {
        margin-bottom: 1rem;
      }
      
      .operation-result {
        min-height: 100px;
      }
      
      .instruction {
        color: #7f8c8d;
        font-style: italic;
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
  <h2>Encapsulating Async State in Ember</h2>
  <AsyncStateDemo />
</template>
