# Use with your styleguide

In Ember's strict mode, components must be imported in order
to be rendered. The default resolver, which has everything available
in the global namespace, is not used.

For more information on template-strict-mode, view
[RFC#496](https://github.com/emberjs/rfcs/pull/496)

With embroider, you'll want to add this to your `extraPublicTrees` list:
```js
extraPublicTrees: [
  // ...
  require('ember-repl').buildComponentMap([
    'limber/components/limber/menu',
    'limber/components/limber/header',
    'limber/components/external-link',
    'ember-popperjs',
    'ember-repl',
  ]),
]
```

<hr>

## `<ExternalLink />`

All external links should use the `<ExternalLink />` component.
An icon on the right side of the link indicates that the link is external.

```gjs  live preview
import ExternalLink from 'limber/components/external-link';

<template>
  <ExternalLink href="#">Link</ExternalLink>
  <ExternalLink href="https://emberjs.com">Ember.JS' Site</ExternalLink>
</template>
```

## `<Shadowed />`

Wraps the template block in a shadow dom with the correctly imported CSS so that
component renderings can escape the default "prose" styling of the surrounding markdown.

```gjs  live preview
import Shadowed from 'limber/components/shadowed';

<template>
  <ul><li>Styled</li><li>by Prose</li></ul>

  <Shadowed>
    <ul><li>Unstyled</li><li>thanks to shadowdom</li></ul>
  </Shadowed>
</template>
```

## `<Header />`

The `<Header />` component takes no arguments and offers no customization.
It is not intended to be reusable, as it is the banner that goes across the whole
app.

```gjs  live preview
import Header from 'limber/components/limber/header';
import Shadowed from 'limber/components/shadowed';

<template>
  <Shadowed>
    <Header />
  </Shadowed>
</template>
```


## `<Menu />`

The `<Menu />` component takes no arguments, but still allows for
customization of the trigger content and the the list.

```gjs  live preview
import Menu from 'limber/components/limber/menu';
import Shadowed from 'limber/components/shadowed';

<template>
  <Shadowed>
    <Menu>
      <:trigger as |t|>
        <t.Default>
          toggle menu
        <t.Default>
      </:trigger>

      <:options as |Item|>
        <Item> item a </Item>
        <Item> item b </Item>
      </:options>
    </Menu>
  </Shadowed>
</template>
```

