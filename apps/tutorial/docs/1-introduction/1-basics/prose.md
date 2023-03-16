Welcome to this interactive Glimmer/Ember tutorial.
Through these pages, you'll learn how to be effective and proficient in the reactivity, syntax, and component patterns that Ember and Glimmer provide.

This is an unofficial set of tutorials and is maintained by the community.
The [official guides][ember-guides] provide an excellent [tutorial][ember-tutorial] for building a real app, starting from scratch.

The format of this tutorial is _heavily_ inspired by the [Svelte tutorial][svelte-tutorial].

[ember-guides]: https://guides.emberjs.com/release/
[ember-tutorial]: https://guides.emberjs.com/release/tutorial/part-1/
[svelte-tutorial]: https://svelte.dev/tutorial/basics

## What are these words?

[glimmer-home]: https://glimmerjs.com/
[ember-home]: https://emberjs.com/
[wiki-repl]: https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop

### Glimmer

Glimmer is a family of utilities for making "fast and light components for the web".
It consists of the novel reactivity system and primitives, a component library, and a renderer for those primitives.
[Website][glimmer-home] here.

### Ember

Ember is "A framework for ambitious web developers", and builds on top of Glimmer, providing additional app/SDK abstractions for reducing the menial differences between apps. It consistents of a well integrated test framework, router, state-management, tutorials, thorough documentation, and intecremental improvements to help not leave the ecosystem behind as JavaScript evolves.
[Website][ember-home] here.

### Limber

Limber is a [REPL][wiki-repl] that aims at providing an easy way to share code examples, samples, and reproductions for both the GlimmerJS (`.gjs`) file format as well as interactive documentation authoring via mixing in GlimmerJS on top of markdown.

## How to use this tutorial

This tutorial focuses on GlimmerJS, the syntax, and concepts needed to maximize productivity.
It'll be necessary to have a basic understanding of HTML and JavaScript.

The tutorial includes mini exercises that are designed to demonstrate various features and patterns.
The later chapters in the tutorial build upon the knowledge acquired in the earlier chapters,
so it is recommended to progress sequentially from the beginning to the end.
The dropdown menu above can be used for navigation if needed.

Each tutorial chapter includes a 'Show me' button that can be used if you encounter difficulties.
However, manually typing in the editor for each example is a more effective way to learn and enhance your skills -- but also there is no shame in asking for help!

On smaller screens, there is a button in the bottom right of the screen so that slides the tutorial text out of the way so that the editor can be interacted with.

## What are components?

Components are a meta-building block which packages the native primitives, allowing for easier re-distribution of a specific configuration of those primitives.
The primitives in Glimmer/Ember are:

- Resources
- Functions
- Modifiers
- Elements

A component may include 1 or more of these primitives and is "invoked" with angle-brackets, e.g.: `<MyComponent />`
