# Clock Resource in Ember

A clock resource is a useful abstraction for applications that need to display or react to the current time. In Ember, you can create a reusable clock resource that provides real-time updates and can be consumed by multiple components.

## Understanding Clock Resources

When working with clock resources in Ember, it's important to understand:

1. Resources are objects that manage their own lifecycle
2. A clock resource typically uses `setInterval` to update the time at regular intervals
3. The resource should clean up after itself when it's no longer needed
4. The time can be exposed as a tracked property for reactive updates

## Creating a Basic Clock Resource

Here's how to create a basic clock resource:

```js
// app/resources/clock.js
import { tracked } from '@glimmer/tracking';
import { resource } from 'ember-resources';

export const Clock = resource(({ on }) => {
  const clock = { 
    @tracked time: new Date() 
  };
  
  const intervalId = setInterval(() => {
    clock.time = new Date();
  }, 1000);
  
  on.cleanup(() => {
    clearInterval(intervalId);
  });
  
  return clock;
});
```

## Using the Clock Resource

You can use the clock resource in your components:

```js
import Component from '@glimmer/component';
import { Clock } from '../resources/clock';

export default class ClockDisplay extends Component {
  clock = Clock();
  
  get formattedTime() {
    return this.clock.time.toLocaleTimeString();
  }
  
  <template>
    <div>Current time: {{this.formattedTime}}</div>
  </template>
}
```

## Creating a Configurable Clock Resource

You can make the clock resource more configurable:

```js
export const Clock = resource(({ on, use }) => {
  const updateInterval = use.args.named.updateInterval ?? 1000;
  const format = use.args.named.format ?? 'time';
  
  const clock = { 
    @tracked time: new Date(),
    @tracked formattedTime: ''
  };
  
  function updateTime() {
    const now = new Date();
    clock.time = now;
    
    if (format === 'time') {
      clock.formattedTime = now.toLocaleTimeString();
    } else if (format === 'date') {
      clock.formattedTime = now.toLocaleDateString();
    } else if (format === 'datetime') {
      clock.formattedTime = now.toLocaleString();
    }
  }
  
  // Initialize
  updateTime();
  
  const intervalId = setInterval(updateTime, updateInterval);
  
  on.cleanup(() => {
    clearInterval(intervalId);
  });
  
  return clock;
});
```

<p class="call-to-play">
  Complete the <code>ClockDemo</code> component by:
  <ul>
    <li>Implementing a clock resource that updates the time at regular intervals</li>
    <li>Creating a digital clock display that shows hours, minutes, and seconds</li>
    <li>Adding an analog clock with hour, minute, and second hands</li>
    <li>Implementing configuration options for the clock format and update interval</li>
  </ul>
</p>

[Documentation for Ember Resources][ember-resources]
[Documentation for JavaScript Date object][mdn-date]
[Documentation for setInterval][mdn-setinterval]

[ember-resources]: https://github.com/NullVoxPopuli/ember-resources
[mdn-date]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[mdn-setinterval]: https://developer.mozilla.org/en-US/docs/Web/API/setInterval
