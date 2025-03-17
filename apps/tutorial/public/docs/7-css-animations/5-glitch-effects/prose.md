# CSS Glitch Effects

Glitch effects are popular in modern web design, creating a distorted, digital error aesthetic. These effects can be created using CSS animations and clever combinations of text shadows, clip-path, and filters.

## Understanding Glitch Animations

Glitch effects typically involve:

1. **Layer splitting**: Creating copies of text or images with slight offsets
2. **Color shifting**: Using RGB color splits
3. **Distortion**: Applying transformations or clip-path to create jagged edges
4. **Flickering**: Rapidly changing properties to create a flickering effect

## Creating Text Glitch Effects

Text glitch effects often use multiple text-shadow properties with different colors and positions, combined with animations that change these properties rapidly:

```css
.glitch-text {
  position: relative;
  animation: glitch 1s infinite;
}

@keyframes glitch {
  0% {
    text-shadow: 2px 0 0 red, -2px 0 0 blue;
    transform: translate(0);
  }
  25% {
    text-shadow: -2px 0 0 red, 2px 0 0 blue;
    transform: translate(1px);
  }
  50% {
    text-shadow: 2px 0 0 red, -2px 0 0 blue;
    transform: translate(0);
  }
  75% {
    text-shadow: -2px 0 0 red, 2px 0 0 blue;
    transform: translate(-1px);
  }
  100% {
    text-shadow: 2px 0 0 red, -2px 0 0 blue;
    transform: translate(0);
  }
}
```

## Creating Image Glitch Effects

For images, we can use the `clip-path` property to create slices and the `filter` property to add color distortion:

```css
.glitch-image {
  position: relative;
  animation: image-glitch 2s infinite;
}

@keyframes image-glitch {
  0% {
    clip-path: inset(10% 0 20% 0);
    filter: hue-rotate(0deg);
  }
  10% {
    clip-path: inset(40% 0 50% 0);
    filter: hue-rotate(90deg);
  }
  20% {
    clip-path: inset(20% 0 30% 0);
    filter: hue-rotate(180deg);
  }
  /* ... more keyframes ... */
  100% {
    clip-path: inset(10% 0 20% 0);
    filter: hue-rotate(0deg);
  }
}
```

<p class="call-to-play">
  Complete the <code>GlitchEffects</code> component by implementing the missing glitch animations:
  <ul>
    <li>Create a text glitch effect using text-shadow and transform</li>
    <li>Create an image glitch effect using clip-path and filters</li>
    <li>Create a flicker effect using opacity and visibility</li>
  </ul>
</p>

[Documentation for CSS Animations][mdn-animations]
[Documentation for CSS Filters][mdn-filters]
[Documentation for clip-path][mdn-clip-path]

[mdn-animations]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations
[mdn-filters]: https://developer.mozilla.org/en-US/docs/Web/CSS/filter
[mdn-clip-path]: https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path
