# All markdown renderables 

- [Ember](#ember)
- [Svelte](#svelte)
- [Vue](#vue)
- [Mermaid](#mermaid)
- [React](#react)

## Ember


```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class HelloWorld extends Component {
  @tracked count = 0;
  increment = () => this.count += 1;

  <template>
    <p>You have clicked the button {{this.count}} times.</p>

    <button {{on "click" this.increment}}>Click</button>
  </template>
}
```


Alternate format that exists only in this REPL

```hbs ember live
<ul>
  {{#each (array
    (hash href='https://emberjs.com' text='Ember home page')
    (hash href='https://github.com/nullvoxpopuli' text='My GitHub')
    (hash href='https://twitter.com/nullvoxpopuli' text='My Twitter')
  ) as |site|}}
    <li>
      <a href={{site.href}} target="_blank">{{site.text}}</a>
    </li>
  {{/each}}
</ul>
```

## Svelte

```svelte live
<script>
	let value = $state(0);
</script>

<p>The current value is {value}</p>

<button onclick={() => value -= 1}>-1</button>
<button onclick={() => value += 1}>+1</button>
```

## Vue

```vue live
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">You clicked me {{ count }} times.</button>
</template>
```

## Mermaid

```mermaid
---
config:
      theme: redux
---
flowchart TD
        A(["Start"])
        A --> B{"Decision"}
        B --> C["Option A"]
        B --> D["Option B"]
```

## React


```jsx react live
import React, { useState } from 'react';  

function Counter() {  
  const [count, setCount] = useState(0);  

  const increment = () => setCount((prevCount) => prevCount + 1);  
  const decrement = () => setCount((prevCount) => prevCount - 1);  

  return (  
    <div>  
      <h2>Count: {count}</h2>  
      <button onClick={increment}>Increment</button>  
      <button onClick={decrement}>Decrement</button>  
    </div>  
  );
} 

export default <Counter />;  
```

