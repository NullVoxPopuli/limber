# Limber Editor

## With JavaScript

code fence tags can be used to directly render components,
as well as render the code snippet the live code comes from.

Options:

 - `live` - _renders in place_
 - `live preview` _renders in place, placing the source after the live render_
 - `live preview below` _renders in place, placing the live render below the source_

```gjs live
<template>
  Hello, Glimmer!
</template>
```

```gjs live preview
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
