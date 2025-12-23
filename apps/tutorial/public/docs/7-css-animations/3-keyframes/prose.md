# CSS Keyframe Animations

CSS keyframe animations provide more control over animations than transitions. They allow you to define multiple steps or keyframes in an animation sequence.

## Basic @keyframes Syntax

The basic syntax for CSS keyframe animations includes:

```css
@keyframes animation-name {
  0% {
    /* CSS properties at start */
  }
  50% {
    /* CSS properties at middle */
  }
  100% {
    /* CSS properties at end */
  }
}

.element {
  animation-name: animation-name;
  animation-duration: time-in-seconds;
  animation-timing-function: easing-function;
  animation-delay: time-in-seconds;
  animation-iteration-count: number | infinite;
  animation-direction: normal | reverse | alternate | alternate-reverse;
  animation-fill-mode: none | forwards | backwards | both;
}
```

Or using the shorthand:

```css
.element {
  animation: animation-name duration timing-function delay iteration-count direction fill-mode;
}
```

<p class="call-to-play">
  Complete the <code>KeyframeDemo</code> component by implementing the missing CSS keyframe animations:
  <ul>
    <li>Create a pulse animation for the notification badge</li>
    <li>Create a bounce animation for the button</li>
    <li>Create a fade-in animation for the message</li>
  </ul>
</p>

[Documentation for CSS Animations][mdn-animations]
[Documentation for Ember Modifiers][docs-modifiers]

[mdn-animations]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations
[docs-modifiers]: https://api.emberjs.com/ember/release/modules/@ember%2Fmodifier
