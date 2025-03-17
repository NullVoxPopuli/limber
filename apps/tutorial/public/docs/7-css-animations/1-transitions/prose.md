# CSS Transitions

CSS transitions provide a way to control animation speed when changing CSS properties. Instead of having property changes take effect immediately, you can cause the changes to take place over a period of time.

Transitions are a powerful way to enhance user experience by providing visual feedback for state changes in your application.

## Basic Transition Syntax

The basic syntax for CSS transitions includes:

```css
.element {
  transition-property: property-to-animate;
  transition-duration: time-in-seconds;
  transition-timing-function: easing-function;
  transition-delay: time-in-seconds;
}
```

Or using the shorthand:

```css
.element {
  transition: property-to-animate time-in-seconds easing-function delay;
}
```

## Common Use Cases

Transitions are commonly used for:
- Hover effects
- Button state changes
- Expanding/collapsing elements
- Fading elements in/out

<p class="call-to-play">
  Complete the <code>TransitionDemo</code> component by implementing the missing CSS transitions:
  <ul>
    <li>Add a color transition to the button on hover</li>
    <li>Add a transform transition to the card on hover</li>
    <li>Add a height transition to the expandable section</li>
  </ul>
</p>

[Documentation for CSS Transitions][mdn-transitions]
[Documentation for Ember Modifiers][docs-modifiers]

[mdn-transitions]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions
[docs-modifiers]: https://api.emberjs.com/ember/release/modules/@ember%2Fmodifier
