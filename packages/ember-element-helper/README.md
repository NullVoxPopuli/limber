ember-element-helper
==============================================================================

[![Build Status](https://github.com/tildeio/ember-element-helper/actions/workflows/ci.yml/badge.svg)](https://github.com/tildeio/ember-element-helper/actions/workflows/ci.yml)

Dynamic element helper for Glimmer templates.

This addon provides a ~~polyfill~~ high fidelity reference implementation of
[RFC #389](https://github.com/emberjs/rfcs/pull/389), including the proposed
amendments in [RFC PR #620](https://github.com/emberjs/rfcs/pull/620).

Please note that while [RFC #389](https://github.com/emberjs/rfcs/pull/389)
has been approved, it has not been implemented in Ember.js yet. As such, the
feature is still subject to change based on implementation feedback.

When this feature is implemented in Ember.js, we will release a 1.0 version of
this addon as a true polyfill for the feature, allowing the feature to be used
on older Ember.js versions and be completely inert on newer versions where the
official implementation is available.

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Node.js v12 or above

Limitations
------------------------------------------------------------------------------

This implementation has the following known limitations:

* By default, an auto-generated `id` attribute will be added to the element
  (e.g. `id="ember123"`). It is possible to override this by providing an
  `id` attribute when invoking the component (e.g. `<Tag id="my-id" />`).
  However, it is not possible to remove the `id` attribute completely. The
  proposed helper will not have this behavior, as such this should not be
  relied upon (e.g. in CSS and `qunit-dom` selectors).

* The element will have an `ember-view` class (i.e. `class="ember-view"`).
  This is in addition and merged with the class attribute provided when
  invoking the component (e.g. `<Tag class="my-class" />` will result in
  something like `<div class="ember-view my-class" />`). It is not possible
  to remove the `ember-view` class. The proposed helper will not have this
  behavior, as such this should not be relied upon (e.g. in CSS and `qunit-dom`
  selectors).

* In Ember versions before 3.11, modifiers cannot be passed to the element,
  even when addons such as the [modifier manager](https://github.com/ember-polyfills/ember-modifier-manager-polyfill)
  and [on modifier](https://github.com/buschtoens/ember-on-modifier) polyfills
  are used. Doing so requires [RFC #435](https://github.com/emberjs/rfcs/blob/master/text/0435-modifier-splattributes.md)
  which is first available on Ember 3.11. This is an Ember.js limitation,
  unrelated to this addon.

Installation
------------------------------------------------------------------------------

```
ember install ember-element-helper
```

Usage
------------------------------------------------------------------------------

```hbs
{{#let (element this.tagName) as |Tag|}}
  <Tag class="my-tag">hello world!</Tag>
{{/let}}
```

You can also pass around the result of invoking this helper into any components
that accepts "contextual components" as arguments:

```hbs
<MyComponent @tag={{element "span"}} />
```

```hbs
{{!-- in my-component.hbs --}}
{{#let @tag as |Tag|}}
  <Tag class="my-tag">hello world!</Tag>
{{/let}}

{{!-- ...or more directly... --}}
<@tag class="my-tag">hello world!</@tag>
```

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
