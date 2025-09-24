# Encapsulating Async State

When working with asynchronous operations in Ember/Glimmer applications, it's important to properly encapsulate the state management. This includes handling loading states, errors, and the successful result.

```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { resource, cell } from 'ember-resources';
import { on } from '@ember/modifier';

// A resource that encapsulates async state
const AsyncData = resource(({ use, on }) => {
  let state = cell({
    isLoading: true,
    error: null,
    data: null
  });
  
  // Simulate an API call
  let fetchData = async () => {
    state.current = { isLoading: true, error: null, data: null };
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful response
      const data = { name: 'Example Data', value: Math.floor(Math.random() * 100) };
      state.current = { isLoading: false, error: null, data };
    } catch (error) {
      state.current = { isLoading: false, error, data: null };
    }
  };
  
  // Initial fetch
  fetchData();
  
  // Expose a refresh method
  return {
    get isLoading() { return state.current.isLoading; },
    get error() { return state.current.error; },
    get data() { return state.current.data; },
    refresh: fetchData
  };
});

class AsyncExample extends Component {
  <template>
    {{#let (AsyncData) as |async|}}
      <div class="async-example">
        <h3>Async Data Example</h3>
        
        {{#if async.isLoading}}
          <p>Loading data...</p>
        {{else if async.error}}
          <p class="error">Error: {{async.error.message}}</p>
        {{else}}
          <div class="data">
            <p>Name: {{async.data.name}}</p>
            <p>Value: {{async.data.value}}</p>
          </div>
        {{/if}}
        
        <button {{on "click" async.refresh}} disabled={{async.isLoading}}>
          {{if async.isLoading "Loading..." "Refresh Data"}}
        </button>
      </div>
    {{/let}}
    
    <style>
      .async-example {
        border: 1px solid #ccc;
        padding: 1rem;
        border-radius: 4px;
        max-width: 400px;
        margin: 0 auto;
      }
      
      .error {
        color: red;
      }
      
      .data {
        background-color: #f0f0f0;
        padding: 1rem;
        border-radius: 4px;
        margin: 1rem 0;
      }
      
      button {
        padding: 0.5rem 1rem;
        background-color: #0078e7;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
    </style>
  </template>
}

<template>
  <AsyncExample />
</template>
```

This example demonstrates several important patterns:

1. **State Encapsulation**: The `AsyncData` resource encapsulates all the state related to the async operation (loading, error, data).

2. **Consistent State Transitions**: The state transitions follow a predictable pattern:
   - Start with loading state
   - End with either error or success state
   - Never have inconsistent states

3. **Reusability**: The resource can be reused across components.

4. **Exposing Minimal Interface**: Only expose what's needed (isLoading, error, data, refresh).

5. **User Feedback**: Always provide feedback about the current state to the user.

By following these patterns, you can create more maintainable and user-friendly async operations in your applications.

[Documentation for ember-resources][ember-resources]
[Documentation for tracked properties][tracked-properties]

[ember-resources]: https://github.com/NullVoxPopuli/ember-resources
[tracked-properties]: https://api.emberjs.com/ember/release/modules/@glimmer%2Ftracking
