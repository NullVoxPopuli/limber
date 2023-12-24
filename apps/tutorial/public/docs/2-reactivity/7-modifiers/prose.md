A modifier, or _element modifier_, is a utility for performing some action on an _element_.

Like resources, modifiers also have cleanup -- and modifiers could be thought of as resource builders that take an element as one of their arguments.

For example, we could apply an animation to an element:

```gjs
import { modifier } from 'ember-modifier';

const intensify = modifier((element) => {
  let animation = element.animate([
    { transform: "translateX(2px)" },
    { transform: "translateY(2px)" },
    { transform: "translateX(-2px)" },
  ], {
    duration: 100,
    iterations: Infinity,
  });

  return () => animation.cancel();
});
```

Try applying the modifier:

```hbs
<div {{intensify}}>
  content
</div>
```

It's important to cleanup a modifier so that state, whether in-app, or in native built-in browser state, doesn't leak.
In this example, the animation in cancelled when the element is no longer rendered.

Full docs for modifiers can be found on the [`ember-modifier`][gh-e-modifier] GitHub.

[gh-e-modifier]: https://github.com/ember-modifier/ember-modifier
