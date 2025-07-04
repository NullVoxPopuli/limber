# Use with your styleguide

All code fences are strict mode, which means all components must be imported in order to be rendered.

For more information on ember's template-strict-mode, view
[RFC#496](https://github.com/emberjs/rfcs/pull/496)

<hr>

## `<ExternalLink />`

All external links should use the `<ExternalLink />` component.
An icon on the right side of the link indicates that the link is external.

```gjs live preview
import { ExternalLink } from 'limber-ui';

<template>
  <ExternalLink href="#">Link</ExternalLink>
  <ExternalLink href="https://emberjs.com">Ember.JS' Site</ExternalLink>
</template>
```

## `<Shadowed />`

Wraps the template block in a shadow dom with the correctly imported CSS so that
component renderings can escape the default "prose" styling of the surrounding markdown.

```gjs live preview
import { Shadowed } from 'ember-primitives';

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

```gjs live preview
import Header from 'limber/components/limber/header';
import { Shadowed, PortalTargets } from 'ember-primitives';

<template>
  <Shadowed @includeStyles={{true}}>
    <PortalTargets />
    <Header />
  </Shadowed>
</template>
```

## `<Menu />`

The `<Menu />` component takes no arguments, but still allows for
customization of the trigger content and the the list.

```gjs live preview
import Menu from 'limber/components/menu';
import { Shadowed, PortalTargets } from 'ember-primitives';

<template>
  <Shadowed @includeStyles={{true}}>
    <PortalTargets />
    <Menu>
      <:trigger as |t|>
        <t.Default>
          toggle menu
        </t.Default>
      </:trigger>

      <:options as |Item|>
        <Item> item a </Item>
        <Item> item b </Item>
      </:options>
    </Menu>
  </Shadowed>
</template>
```
