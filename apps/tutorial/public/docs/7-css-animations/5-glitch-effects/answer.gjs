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
        position: relative;
      }
      
      /* Text glitch effect using text-shadow and transform */
      .glitch-text.active {
        animation: textGlitch 0.3s infinite;
      }
      
      .glitch-image {
        width: 200px;
        height: 150px;
        background-color: #333;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
      }
      
      /* Image glitch effect using clip-path and filters */
      .glitch-image.active {
        animation: imageGlitch 0.5s infinite;
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
      
      /* Flicker effect using opacity and visibility */
      .flicker-element.active {
        animation: flicker 2s infinite;
      }
      
      /* Keyframes for text glitch animation */
      @keyframes textGlitch {
        0% {
          text-shadow: 2px 0 0 rgba(255, 0, 0, 0.7), -2px 0 0 rgba(0, 255, 255, 0.7);
          transform: translate(0);
        }
        25% {
          text-shadow: -2px 0 0 rgba(255, 0, 0, 0.7), 2px 0 0 rgba(0, 255, 255, 0.7);
          transform: translate(1px, 1px);
        }
        50% {
          text-shadow: -3px 0 0 rgba(255, 0, 0, 0.7), 3px 0 0 rgba(0, 255, 255, 0.7);
          transform: translate(-1px, -2px);
        }
        75% {
          text-shadow: 1px 0 0 rgba(255, 0, 0, 0.7), -1px 0 0 rgba(0, 255, 255, 0.7);
          transform: translate(2px, -1px);
        }
        100% {
          text-shadow: 2px 0 0 rgba(255, 0, 0, 0.7), -2px 0 0 rgba(0, 255, 255, 0.7);
          transform: translate(0);
        }
      }
      
      /* Keyframes for image glitch animation */
      @keyframes imageGlitch {
        0% {
          clip-path: inset(10% 0 20% 0);
          filter: hue-rotate(0deg);
          transform: translate(0);
        }
        10% {
          clip-path: inset(40% 0 50% 0);
          filter: hue-rotate(90deg);
          transform: translate(-2px, 2px);
        }
        20% {
          clip-path: inset(20% 0 30% 0);
          filter: hue-rotate(180deg);
          transform: translate(2px, -2px);
        }
        30% {
          clip-path: inset(60% 0 70% 0);
          filter: hue-rotate(270deg);
          transform: translate(-1px, -1px);
        }
        40% {
          clip-path: inset(10% 0 20% 0);
          filter: hue-rotate(360deg);
          transform: translate(1px, 1px);
        }
        50% {
          clip-path: inset(30% 0 10% 0);
          filter: hue-rotate(180deg) saturate(2);
          transform: translate(0);
        }
        60% {
          clip-path: inset(50% 0 40% 0);
          filter: hue-rotate(90deg) saturate(1.5);
          transform: translate(2px, 2px);
        }
        70% {
          clip-path: inset(70% 0 80% 0);
          filter: hue-rotate(270deg) saturate(0.5);
          transform: translate(-2px, -2px);
        }
        80% {
          clip-path: inset(80% 0 90% 0);
          filter: hue-rotate(180deg) saturate(1);
          transform: translate(1px, -1px);
        }
        90% {
          clip-path: inset(40% 0 30% 0);
          filter: hue-rotate(90deg) saturate(2);
          transform: translate(-1px, 1px);
        }
        100% {
          clip-path: inset(10% 0 20% 0);
          filter: hue-rotate(0deg);
          transform: translate(0);
        }
      }
      
      /* Keyframes for flicker animation */
      @keyframes flicker {
        0%, 100% {
          opacity: 1;
        }
        5%, 9% {
          opacity: 0.8;
        }
        10% {
          opacity: 0.1;
        }
        11%, 15% {
          opacity: 0.9;
        }
        16% {
          opacity: 0.2;
        }
        17%, 29% {
          opacity: 1;
        }
        30% {
          opacity: 0.1;
        }
        31%, 50% {
          opacity: 1;
        }
        51% {
          opacity: 0.3;
        }
        52%, 60% {
          opacity: 1;
        }
        61% {
          opacity: 0.7;
        }
        62%, 70% {
          opacity: 1;
        }
        71% {
          opacity: 0.2;
        }
        72%, 80% {
          opacity: 1;
        }
        81% {
          opacity: 0.4;
        }
        82%, 99% {
          opacity: 1;
        }
      }
    </style>
  </template>
}

<template>
  <h2>CSS Glitch Effects Demo</h2>
  <GlitchEffects />
</template>
