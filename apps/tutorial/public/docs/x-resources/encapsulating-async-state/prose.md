# Encapsulating Async State in Ember

Encapsulating asynchronous state is a pattern that helps manage the complexity of asynchronous operations in your Ember applications. By creating dedicated resources or services to handle async operations, you can keep your components clean and focused on presentation rather than data fetching logic.

## Understanding Async State Encapsulation

When working with async state encapsulation in Ember, it's important to understand:

1. Async operations (like API calls) have multiple states: loading, success, error
2. These states should be tracked and exposed in a consistent way
3. Components should be able to react to state changes without managing the async logic
4. Resources or services can provide a clean abstraction for async operations

## Creating an Async Data Resource

Here's how to create a basic async data resource:

```js
// app/resources/data-fetcher.js
import { tracked } from '@glimmer/tracking';
import { resource } from 'ember-resources';

export const DataFetcher = resource(({ on, use }) => {
  const url = use.args.positional[0];
  
  const state = {
    @tracked data: null,
    @tracked isLoading: true,
    @tracked error: null
  };
  
  async function fetchData() {
    state.isLoading = true;
    state.error = null;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      state.data = data;
    } catch (error) {
      state.error = error;
    } finally {
      state.isLoading = false;
    }
  }
  
  // Initial fetch
  fetchData();
  
  return state;
});
```

## Using the Async Data Resource

You can use the async data resource in your components:

```js
import Component from '@glimmer/component';
import { DataFetcher } from '../resources/data-fetcher';

export default class UserProfile extends Component {
  user = DataFetcher(`/api/users/${this.args.userId}`);
  
  <template>
    {{#if this.user.isLoading}}
      <p>Loading user data...</p>
    {{else if this.user.error}}
      <p>Error: {{this.user.error.message}}</p>
    {{else}}
      <h2>{{this.user.data.name}}</h2>
      <p>Email: {{this.user.data.email}}</p>
    {{/if}}
  </template>
}
```

## Creating a Reusable Async Operation Hook

You can also create a more generic hook for async operations:

```js
// app/utils/use-async.js
import { tracked } from '@glimmer/tracking';

export function useAsync(asyncFunction) {
  const state = {
    @tracked data: null,
    @tracked isLoading: false,
    @tracked error: null,
    
    async execute(...args) {
      state.isLoading = true;
      state.error = null;
      
      try {
        const result = await asyncFunction(...args);
        state.data = result;
        return result;
      } catch (error) {
        state.error = error;
        throw error;
      } finally {
        state.isLoading = false;
      }
    }
  };
  
  return state;
}
```

<p class="call-to-play">
  Complete the <code>AsyncStateDemo</code> component by:
  <ul>
    <li>Implementing a resource that encapsulates the state of an async operation</li>
    <li>Creating a component that displays different UI based on the async state (loading, success, error)</li>
    <li>Adding retry functionality for failed operations</li>
    <li>Implementing a way to trigger different async scenarios for demonstration purposes</li>
  </ul>
</p>

[Documentation for Ember Resources][ember-resources]
[Documentation for JavaScript Promises][mdn-promises]
[Documentation for Fetch API][mdn-fetch]

[ember-resources]: https://github.com/NullVoxPopuli/ember-resources
[mdn-promises]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[mdn-fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
