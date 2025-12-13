# Building a Video Player Component

HTML5 video playback is a powerful feature that allows us to create rich media experiences in web applications. By combining the native `<video>` element with Ember/Glimmer components, we can build a fully-featured video player with custom controls.

In this tutorial, we'll create a video player component that includes:

1. Play/pause functionality
2. Time tracking and seeking
3. Volume and mute controls
4. Fullscreen toggle
5. Custom overlay controls

## The Video Element

The HTML5 `<video>` element provides the foundation for our player:

```html
<video src="path/to/video.mp4"></video>
```

The video element offers several methods and properties for controlling playback:
- `play()` and `pause()` - Control playback
- `currentTime` - Get or set the current playback position
- `duration` - Get the total duration of the video
- `volume` - Get or set the audio volume (0.0 to 1.0)
- `muted` - Get or set whether the audio is muted
- `requestFullscreen()` - Enter fullscreen mode

It also fires events we can listen for:
- `timeupdate` - Fired when the current playback position changes
- `durationchange` - Fired when the duration becomes available
- `play` and `pause` - Fired when playback starts or pauses
- `ended` - Fired when playback reaches the end
- `volumechange` - Fired when volume or muted state changes

<p class="call-to-play">
  Complete the <code>VideoPlayer</code> component by implementing the missing functionality:
  <ul>
    <li>Store the video element reference in <code>setupVideo</code></li>
    <li>Set up event listeners to update the component state</li>
    <li>Implement play/pause functionality</li>
    <li>Implement mute/unmute functionality</li>
    <li>Implement fullscreen toggle</li>
    <li>Implement volume control</li>
    <li>Implement seeking functionality</li>
  </ul>
</p>

[Documentation for HTML Video Element][mdn-video]
[Documentation for Fullscreen API][mdn-fullscreen]
[Documentation for tracked properties][tracked-properties]
[Documentation for on modifier][docs-on]

[mdn-video]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
[mdn-fullscreen]: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
[tracked-properties]: https://api.emberjs.com/ember/release/modules/@glimmer%2Ftracking
[docs-on]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/on?anchor=on
