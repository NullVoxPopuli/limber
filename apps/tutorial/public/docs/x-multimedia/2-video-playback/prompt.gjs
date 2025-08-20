import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class VideoPlayer extends Component {
  // Reference to the video element
  videoElement = null;
  
  // Track playback state
  @tracked isPlaying = false;
  @tracked isMuted = false;
  @tracked isFullscreen = false;
  @tracked currentTime = 0;
  @tracked duration = 0;
  @tracked volume = 1.0;
  
  // Set default video source if not provided
  get videoSrc() {
    return this.args.src || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  }
  
  @action
  setupVideo(element) {
    // TODO: Store the video element reference
    // TODO: Set up event listeners for timeupdate, durationchange, play, pause, ended, and volumechange
    // TODO: Set initial volume
  }
  
  @action
  togglePlay() {
    // TODO: Implement play/pause functionality
  }
  
  @action
  toggleMute() {
    // TODO: Implement mute/unmute functionality
  }
  
  @action
  toggleFullscreen() {
    // TODO: Implement fullscreen toggle
  }
  
  @action
  setVolume(event) {
    // TODO: Implement volume control
  }
  
  @action
  setCurrentTime(event) {
    // TODO: Implement seeking functionality
  }
  
  // Format time in MM:SS
  formatTime(timeInSeconds) {
    if (isNaN(timeInSeconds)) return '00:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  <template>
    <div class="video-player">
      <div class="video-container">
        <video 
          src={{this.videoSrc}} 
          {{on "loadedmetadata" this.setupVideo}} 
          {{on "click" this.togglePlay}}
        ></video>
        
        {{#if this.isPlaying}}
          <button class="play-overlay" {{on "click" this.togglePlay}}>
            <span class="play-icon">⏸️</span>
          </button>
        {{else}}
          <button class="play-overlay" {{on "click" this.togglePlay}}>
            <span class="play-icon">▶️</span>
          </button>
        {{/if}}
      </div>
      
      <div class="player-controls">
        <div class="time-controls">
          <span class="current-time">{{this.formatTime this.currentTime}}</span>
          <input 
            type="range" 
            min="0" 
            max={{this.duration}} 
            value={{this.currentTime}} 
            step="0.1" 
            {{on "input" this.setCurrentTime}}
          />
          <span class="duration">{{this.formatTime this.duration}}</span>
        </div>
        
        <div class="button-controls">
          <button {{on "click" this.togglePlay}}>
            {{if this.isPlaying "Pause" "Play"}}
          </button>
          
          <button {{on "click" this.toggleMute}}>
            {{if this.isMuted "Unmute" "Mute"}}
          </button>
          
          <div class="volume-controls">
            <span class="volume-icon">🔊</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              value={{this.volume}} 
              step="0.05" 
              {{on "input" this.setVolume}}
            />
          </div>
          
          <button {{on "click" this.toggleFullscreen}}>
            {{if this.isFullscreen "Exit Fullscreen" "Fullscreen"}}
          </button>
        </div>
      </div>
    </div>
    
    <style>
      .video-player {
        max-width: 640px;
        margin: 0 auto;
        border: 1px solid #ccc;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .video-container {
        position: relative;
        width: 100%;
      }
      
      video {
        width: 100%;
        display: block;
      }
      
      .play-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.2);
        border: none;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      .video-container:hover .play-overlay {
        opacity: 1;
      }
      
      .play-icon {
        font-size: 3rem;
      }
      
      .player-controls {
        padding: 0.5rem;
        background: #f0f0f0;
      }
      
      .time-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      
      .time-controls input {
        flex-grow: 1;
      }
      
      .button-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .volume-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .volume-controls input {
        width: 80px;
      }
      
      button {
        padding: 0.25rem 0.5rem;
        background-color: #0078e7;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    </style>
  </template>
}

<template>
  <h2>Video Player Example</h2>
  <VideoPlayer />
  
  <h3>Custom Video Source</h3>
  <VideoPlayer @src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" />
</template>
