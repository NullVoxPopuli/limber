# CSS Matrix Transforms

CSS matrix transforms provide a powerful way to apply complex transformations to elements. The `matrix()` and `matrix3d()` functions allow you to specify a transformation as a matrix of values, giving you precise control over how elements are transformed.

## Understanding the Matrix Transform

The `matrix()` function is a 2D transformation that combines multiple transformations into one. It takes six parameters:

```css
transform: matrix(a, b, c, d, tx, ty);
```

These parameters represent a transformation matrix:

```
| a c tx |
| b d ty |
| 0 0 1  |
```

Where:
- `a` and `d` control scaling
- `b` and `c` control skewing
- `tx` and `ty` control translation (moving)

For 3D transformations, you can use `matrix3d()` which takes 16 parameters representing a 4x4 matrix.

## Common Matrix Transformations

Here are some common transformations expressed as matrices:

1. **Identity (no transformation)**:
   ```css
   transform: matrix(1, 0, 0, 1, 0, 0);
   ```

2. **Scale by 2x**:
   ```css
   transform: matrix(2, 0, 0, 2, 0, 0);
   ```

3. **Rotate by 45 degrees**:
   ```css
   transform: matrix(0.7071, 0.7071, -0.7071, 0.7071, 0, 0);
   ```

4. **Skew horizontally by 30 degrees**:
   ```css
   transform: matrix(1, 0, 0.5774, 1, 0, 0);
   ```

<p class="call-to-play">
  Complete the <code>MatrixTransforms</code> component by implementing the missing matrix transformations:
  <ul>
    <li>Add a matrix transform that combines rotation and scaling</li>
    <li>Add a matrix transform that creates a perspective effect</li>
    <li>Add a matrix transform that creates a reflection effect</li>
  </ul>
</p>

[Documentation for CSS transform matrix][mdn-matrix]
[Documentation for CSS transform functions][mdn-transform-functions]
[Matrix Calculator Tool][matrix-calculator]

[mdn-matrix]: https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
[mdn-transform-functions]: https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function
[matrix-calculator]: https://www.useragentman.com/matrix/
