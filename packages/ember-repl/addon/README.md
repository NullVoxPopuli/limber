# ember-repl

[![npm version](https://badge.fury.io/js/ember-repl.svg)](https://badge.fury.io/js/ember-repl)
[![CI](https://github.com/NullVoxPopuli/ember-repl/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/NullVoxPopuli/ember-repl/actions/workflows/ci.yml)

Tools for easily creating your own Ember Playground / REPL and/or Interactive
StyleGuide for your design system.

_This package will include all available dev-time dependencies provided by
ember + glimmer as well as `@babel/standalone`._
Your payload will be affected and Embroider is recommended
with maximum strictness enabled so automatic bundle splitting occurs to help
your app's initial time-to-interactive/etc stats.


## Compatibility

* Ember.js v3.27 or above
* Ember CLI v3.27 or above
* Webpack v5 or above
* ember-auto-import v2 or above
* Node.js v14 or above

## Capabilities 

* gjs 
* hbs 
* markdown with gjs/hbs blocks (glimdown)

## Installation

```
ember install ember-repl
```

## Setup

This library uses babel, which does some goofy things in the browser.
You'll need to define a global `process` and `Buffer` somewhere in your app.

For example:
```js 
// app/app.js

// @babel/traverse (from babel-plugin-ember-template-imports)
// accesses process.....
// maybe one day we can have a browser-only verison?
// But they aren't used.... so.. that's fun.
Object.assign(window, {
  process: { env: {} },
  Buffer: {},
});

```

## Usage

### Compiling GJS 

There are two ways to compile gjs text, imperatively via `compileJS`, where you manage the reactivity yourself. 
Or `Compiled`, which is a resource that manages the reactivity for you.

#### Automatic reactivity via the Resource

Following the Resources documentation, you can use `Compiled` in both 
template-only or class-backed contexts:

```js 
import { Compiled } from 'ember-repl';

<template>
  {{#let (Compiled @gjsText 'gjs') as |compileResult|}}

    {{#if compileResult.error}}
      an error! {{compileResult.error}}
    {{/if}}

    {{#if compileResult.component}}
      <compileResult.component />
    {{/if}}

  {{/let}}
</template>

```

One advantage of using a backing JS context, is that you can utilize the `keepLatest` 
resource so that when an error occurs, you could keep rendering the latest successful compile.

```js 
import Component from '@glimmer/component';
import { Compiled } from 'ember-repl';
import { use } from 'ember-resources'; 
import { keepLatest } from 'reactiveweb/keep-latest';

export class Renderer extends Component {
  @use compile = Compiled(() => this.args.gjsText, 'gjs');

  @use latest = keepLatest({
    value: () => this.compile.component,
    when: () => this.compile.error,
  }); 

  <template> 
    {{#if this.compile.error}}
      Error! {{this.compile.error}}
    {{/if}}

    {{! This will keep showing even when there is an error.
        Which can help reduce visual jitter }} 
    {{#if this.latest}}
      <this.latest />
    {{/if}}

  </template>
}
```


#### Managing your own reactivity

```js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { compileJS } from 'ember-repl';

export class Renderer extends Component {
  @tracked compileResult;

  constructor(...args) {
    super(...args);

    compileJS('...').then((compileResult) => this.compileResult = compileResult);
  }
}
```
```hbs
{{#if this.compileResult.component}}
  <this.compileResult.component />
{{/if}}
```


### Compiling HBS 

#### Automatic reactivity via the Resource

The hbs utilities do not provide a utility Resource. 

#### Managing your own reactivity

```js
import Component from '@glimmer/component';
import { compileHBS } from 'ember-repl';

export class Renderer extends Component {
  compileResult = compileHBS(this.args.input);
}
```
```hbs
<this.compileResult.component />
```


### Compiling Markdown

There are two ways to compile markdown text, imperatively via `compile` (passing the `glimdown` format), where you manage the reactivity yourself. 
Or `CompileMarkdown`, which is a resource that manages the reactivity for you.

#### Automatic reactivity via the Resource

Following the Resources documentation, you can use `Compiled` in both 
template-only or class-backed contexts:

```js 
import { Compiled } from 'ember-repl';

<template>
  {{#let (Compiled @mdText 'glimdown') as |compileResult|}}

    {{#if compileResult.error}}
      an error! {{compileResult.error}}
    {{/if}}

    {{#if compileResult.component}}
      <compileResult.component />
    {{/if}}

  {{/let}}
</template>

```

One advantage of using a backing JS context, is that you can utilize the `keepLatest` 
resource so that when an error occurs, you could keep rendering the latest successful compile.

```js 
import Component from '@glimmer/component';
import { Compiled } from 'ember-repl';
import { use } from 'ember-resources'; 
import { keepLatest } from 'reactiveweb/util/keep-latest';

export class Renderer extends Component {
  @use compile = Compiled(() => this.args.mdText, 'glimdown');

  @use latest = keepLatest({
    value: () => this.compile.component,
    when: () => this.compile.error,
  }); 

  <template> 
    {{#if this.compile.error}}
      Error! {{this.compile.error}}
    {{/if}}

    {{! This will keep showing even when there is an error.
        Which can help reduce visual jitter }} 
    {{#if this.latest.value}}
      <this.latest.latest />
    {{/if}}

  </template>
}
```


#### Managing your own reactivity

```js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { compile } from 'ember-repl';

export class Renderer extends Component {
  @tracked component;
  @tracked error;
  @tracked isCompiling;

  constructor(...args) {
    super(...args);

    compile('...', {
      format: 'glimdown', // or 'gjs' or 'hbs'
      onSuccess: async (component) => {
        this.error = null;
        this.isCompiling = false; 
        this.component = component;
        
      },
      onError: async (error) => {
        this.isCompiling = false; 
        this.error = error;
      },
      onCompileStart: async () => {
        this.isCompiling = true; 
      }
    });
  }
}
```
```hbs
{{#if this.component}}
  <this.component />
{{/if}}
```


### Using existing components

`ember-repl` is strict-mode only, so any component that you want to invoke
needs to be passed to the scope option of `compileHBS` or `compileJS`.
Following code is assuming that right next to our `Renderer` component
there is a component named `Bar`.

```js
import Component from '@glimmer/component';
import { compileHBS } from 'ember-repl';
import BarComponent from './bar'

export class Renderer extends Component {
  compileResult = compileHBS(
    '<Bar />',
    {
      scope: {
        Bar: BarComponent
      }
    }
  );
}
```

### Modifiers and Helpers

When writing components / demos / examples using this library, you must use
template-strict mode. Strict mode isn't available by default in proper ember
apps yet. The main difference in strict mode is that all globals must be imported.

Example of a template-only component that only provides a button:

<!-- If you're reading the source for this README, JSX is incorrect, but we
haven't yet PR'd to github for support for this style of writing ember -->
```jsx
import { on } from '@ember/modifier';
import { fn, hash } from '@ember/helper';

<template>
  <button {{on 'click' (fn @callback (hash a=1 b=2))}}>...</button>
</template>
```

For a list of all the imports for things that are global in loose mode, view
the [Strict Mode RFC](https://github.com/emberjs/rfcs/blob/master/text/0496-handlebars-strict-mode.md#keywords)

### Expecting Errors

`compileJS` and `compileHBS` may result an an error.

To handle this, you'll want to make sure that rendering the `component` output is
guarded by either:
 - the truthiness of `component` (which is undefined if `error` is present)
 - the falsiness of `error` (which is undefined if compilation was successful)


Depending on your desired UI/UX, how the async build of updates to input is conveyed
may vary and is not provided by this library.
Here is an example of a way that someone could handle rendering with `compileJS`:

```js
export default class AwaitBuild extends Component {
  @tracked component;
  @tracked error;

  constructor(...args) {
    super(...args);

    compileJS(args.inputText)
      .then(({ component, error }) => {
        this.component = component;
        this.error = error;
      })
      .catch(error => this.error = error);
  }

  get isPending() {
    return !this.component';
  }
}
```
```hbs
{{#if this.error}}
  Error: {{this.error}}
{{else if this.isPending}}
  Building...
{{else}}
  <this.component />
{{/if}}
```


**A Note on Capabilities**
This library currently uses a CommonJS technique for modules, but as browser-support
permits, this library will eventually switch to using a web-worker with an import-map
for lightning fast, `eval`-free REPLing. (But the same security caution below would
still apply)

### API

#### Methods

- `compileJS`: async, returns `compileResult` - compiles a single JS file
   uses the syntax from [ember-template-imports](https://github.com/ember-template-imports/ember-template-imports)
- `compileHBS`: returns `compileResult` - compiles a template-only component with no dependencies
- `invocationOf`: `string` - converts hyphenated text to an `<AngleBracketInvocation />`
- `nameFor`: `string` - generates a component-safe GUID-like derivation from code

#### Properties

```ts
interface CompileResult {
  // invokable from templates
  component?: unknown;

  // if there is a compilation error, this will be non-falsey
  error?: Error;

  // the name assigned to the input text via UUIDv5
  name: string;
}
```

### Using in an app that uses Embroider

If you are using the `Webpack` packager, you will need these settings:

```js
packagerOptions: {
  webpackConfig: {
    node: {
      global: false,
      __filename: true,
      __dirname: true,
    },
    resolve: {
      fallback: {
        path: 'path-browserify',
      },
    },
  },
},
```

## Security

Many developers know that evaluating runnable user input is a huge security risk.
To mitigate risk, this library should not be used in an environment that has access to
sensitive data. Additionally, end-users of this library (users of the consuming app) should
be made aware of the risk so that they themselves do not paste foreign / unrecognized /
untrusted code into the REPL.

This library itself will stay as up to date as possible, and if there are any security concerns,
please email security [at] nullvoxpopuli.com

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.


## License

This project is licensed under the [MIT License](LICENSE.md).
