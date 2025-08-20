import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class GlitchEffects extends Component {
  @tracked isTextGlitching = false;
  @tracked isImageGlitching = false;
  @tracked isFlickering = false;
  
  @action
  toggleTextGlitch() {
    this.isTextGlitching = !this.isTextGlitching;
  }
  
  @action
  toggleImageGlitch() {
    this.isImageGlitching = !this.isImageGlitching;
  }
  
  @action
  toggleFlicker() {
    this.isFlickering = !this.isFlickering;
  }

  <template>
    <div class="demo-container">
      <div class="controls">
        <button {{on "click" this.toggleTextGlitch}}>
          {{if this.isTextGlitching "Stop" "Start"}} Text Glitch
        </button>
        <button {{on "click" this.toggleImageGlitch}}>
          {{if this.isImageGlitching "Stop" "Start"}} Image Glitch
        </button>
        <button {{on "click" this.toggleFlicker}}>
          {{if this.isFlickering "Stop" "Start"}} Flicker Effect
        </button>
      </div>
      
      <div class="glitch-section">
        <h3>Text Glitch Effect</h3>
        <div class="text-container">
          <p class="glitch-text {{if this.isTextGlitching 'active'}}">
            GLITCH TEXT
          </p>
        </div>
      </div>
      
      <div class="glitch-section">
        <h3>Image Glitch Effect</h3>
        <div class="image-container">
          <div class="glitch-image {{if this.isImageGlitching 'active'}}">
            <div class="image-content">
              <div class="placeholder-image">
                <div class="placeholder-text">Image</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="glitch-section">
        <h3>Flicker Effect</h3>
        <div class="flicker-container">
          <div class="flicker-element {{if this.isFlickering 'active'}}">
            FLICKER
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 800px;
        background-color: #111;
        color: #fff;
      }
      
      .controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      
      .controls button {
        padding: 0.5rem 1rem;
        background-color: #333;
        color: #fff;
        border: 1px solid #555;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .glitch-section {
        margin-bottom: 2rem;
        padding: 1rem;
        background-color: #222;
        border-radius: 4px;
      }
      
      .text-container, .image-container, .flicker-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 150px;
        margin-top: 1rem;
      }
      
      .glitch-text {
        font-size: 3rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5rem;
        color: #fff;
      }
      
      /* TODO: Add text glitch effect using text-shadow and transform */
      .glitch-text.active {
        /* Add keyframe animation for text glitch */
      }
      
      .glitch-image {
        width: 200px;
        height: 150px;
        background-color: #333;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      /* TODO: Add image glitch effect using clip-path and filters */
      .glitch-image.active {
        /* Add keyframe animation for image glitch */
      }
      
      .placeholder-image {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2px solid #555;
      }
      
      .placeholder-text {
        font-size: 1.5rem;
        color: #aaa;
      }
      
      .flicker-element {
        font-size: 2rem;
        font-weight: bold;
        padding: 1rem 2rem;
        background-color: #333;
        color: #0f0;
        border-radius: 4px;
      }
      
      /* TODO: Add flicker effect using opacity and visibility */
      .flicker-element.active {
        /* Add keyframe animation for flicker effect */
      }
      
      /* TODO: Define keyframes for text glitch animation */
      
      /* TODO: Define keyframes for image glitch animation */
      
      /* TODO: Define keyframes for flicker animation */
    </style>
  </template>
}

<template>
  <h2>CSS Glitch Effects Demo</h2>
  <GlitchEffects />
</template>
