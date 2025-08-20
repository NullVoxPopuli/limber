import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class AudioPlayer extends Component {
  // Reference to the audio element
  audioElement = null;
  
  // Track playback state
  @tracked isPlaying = false;
  @tracked currentTime = 0;
  @tracked duration = 0;
  @tracked volume = 1.0;
  
  // Set default audio source if not provided
  get audioSrc() {
    return this.args.src || 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';
  }
  
  @action
  setupAudio(element) {
    // TODO: Store the audio element reference
    // TODO: Set up event listeners for timeupdate, durationchange, play, pause, and ended
    // TODO: Set initial volume
  }
  
  @action
  togglePlay() {
    // TODO: Implement play/pause functionality
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
    <div class="audio-player">
      <audio src={{this.audioSrc}} {{on "loadedmetadata" this.setupAudio}}></audio>
      
      <div class="player-controls">
        <button class="play-button" {{on "click" this.togglePlay}}>
          {{if this.isPlaying "Pause" "Play"}}
        </button>
        
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
      </div>
    </div>
    
    <style>
      .audio-player {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 1rem;
        max-width: 500px;
        margin: 0 auto;
      }
      
      .player-controls {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .play-button {
        padding: 0.5rem 1rem;
        background-color: #0078e7;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        width: 80px;
      }
      
      .time-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .time-controls input {
        flex-grow: 1;
      }
      
      .volume-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .volume-controls input {
        width: 100px;
      }
    </style>
  </template>
}

<template>
  <h2>Audio Player Example</h2>
  <AudioPlayer />
  
  <h3>Custom Audio Source</h3>
  <AudioPlayer @src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3" />
</template>
