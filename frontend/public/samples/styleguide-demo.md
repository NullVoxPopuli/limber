# Use with your styleguide

In Ember's strict mode, components must be imported in order
to be rendered. The default resolver, which has everything available
in the global namespace, is not used.

For more information on template-strict-mode, view
[RFC#496](https://github.com/emberjs/rfcs/pull/496)

```gjs  live preview
import ExternalLink from 'limber/components/external-link';

<template>
  <ExternalLink href="#">Link</ExternalLink>
  <ExternalLink href="https://emberjs.com">Ember.JS' Site</ExternalLink>
</template>
```

