# CSS Transforms

CSS transforms allow you to modify the appearance and position of elements without affecting the document flow. You can rotate, scale, skew, or translate elements in 2D or 3D space.

Transforms are often combined with transitions to create smooth animations.

## Basic Transform Syntax

The basic syntax for CSS transforms is:

```css
.element {
  transform: function(value);
}
```

Common transform functions include:
- `translate(x, y)` - Moves an element from its current position
- `scale(x, y)` - Changes the size of an element
- `rotate(angle)` - Rotates an element around a fixed point
- `skew(x-angle, y-angle)` - Skews an element along the X and Y axes

## Combining Transforms

You can combine multiple transforms in a single declaration:

```css
.element {
  transform: translateX(10px) rotate(45deg) scale(1.5);
}
```

<p class="call-to-play">
  Complete the <code>TransformDemo</code> component by implementing the missing CSS transforms:
  <ul>
    <li>Add a rotation transform to the first card</li>
    <li>Add a skew transform to the second card</li>
    <li>Add a combined transform (translate and scale) to the third card</li>
  </ul>
</p>

[Documentation for CSS Transforms][mdn-transforms]
[Documentation for Ember Modifiers][docs-modifiers]

[mdn-transforms]: https://developer.mozilla.org/en-US/docs/Web/CSS/transform
[docs-modifiers]: https://api.emberjs.com/ember/release/modules/@ember%2Fmodifier
