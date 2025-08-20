# Building an Audio Player Component

Audio playback is a common requirement in modern web applications. HTML5 provides the `<audio>` element, which we can enhance with Ember/Glimmer components to create a fully-featured audio player with custom controls.

In this tutorial, we'll build an audio player component that includes:

1. Play/pause functionality
2. Time tracking and seeking
3. Volume control
4. Time formatting

## The Audio Element

The HTML5 `<audio>` element is the foundation of our player. It provides methods and events for controlling audio playback:

```html
<audio src="path/to/audio.mp3"></audio>
```

The audio element has several useful methods and properties:
- `play()` and `pause()` - Control playback
- `currentTime` - Get or set the current playback position
- `duration` - Get the total duration of the audio
- `volume` - Get or set the audio volume (0.0 to 1.0)

It also fires events we can listen for:
- `timeupdate` - Fired when the current playback position changes
- `durationchange` - Fired when the duration becomes available
- `play` and `pause` - Fired when playback starts or pauses
- `ended` - Fired when playback reaches the end

<p class="call-to-play">
  Complete the <code>AudioPlayer</code> component by implementing the missing functionality:
  <ul>
    <li>Store the audio element reference in <code>setupAudio</code></li>
    <li>Set up event listeners to update the component state</li>
    <li>Implement play/pause functionality</li>
    <li>Implement volume control</li>
    <li>Implement seeking functionality</li>
  </ul>
</p>

[Documentation for HTML Audio Element][mdn-audio]
[Documentation for tracked properties][tracked-properties]
[Documentation for on modifier][docs-on]

[mdn-audio]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
[tracked-properties]: https://api.emberjs.com/ember/release/modules/@glimmer%2Ftracking
[docs-on]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/on?anchor=on
