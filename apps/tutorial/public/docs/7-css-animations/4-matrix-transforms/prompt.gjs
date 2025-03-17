import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class MatrixTransforms extends Component {
  @tracked activeCard = null;
  
  @action
  setActiveCard(cardId) {
    this.activeCard = cardId;
  }
  
  @action
  resetActiveCard() {
    this.activeCard = null;
  }

  <template>
    <div class="demo-container">
      <div class="cards-container">
        <div 
          class="card {{if (eq this.activeCard 'card1') 'active'}}" 
          {{on "mouseenter" (fn this.setActiveCard 'card1')}}
          {{on "mouseleave" this.resetActiveCard}}
        >
          <h3>Rotation + Scale</h3>
          <p>This card should rotate and scale using a matrix transform</p>
          <!-- TODO: Add matrix transform that combines rotation and scaling -->
        </div>
        
        <div 
          class="card {{if (eq this.activeCard 'card2') 'active'}}" 
          {{on "mouseenter" (fn this.setActiveCard 'card2')}}
          {{on "mouseleave" this.resetActiveCard}}
        >
          <h3>Perspective Effect</h3>
          <p>This card should have a perspective effect using a matrix transform</p>
          <!-- TODO: Add matrix transform that creates a perspective effect -->
        </div>
        
        <div 
          class="card {{if (eq this.activeCard 'card3') 'active'}}" 
          {{on "mouseenter" (fn this.setActiveCard 'card3')}}
          {{on "mouseleave" this.resetActiveCard}}
        >
          <h3>Reflection Effect</h3>
          <p>This card should have a reflection effect using a matrix transform</p>
          <!-- TODO: Add matrix transform that creates a reflection effect -->
        </div>
      </div>
      
      <div class="matrix-info">
        <h4>Matrix Transform Explanation</h4>
        <p>The matrix() function takes 6 parameters: a, b, c, d, tx, ty</p>
        <pre>
transform: matrix(a, b, c, d, tx, ty);

Equivalent to:
transform: 
  scaleX(a) 
  skewY(b) 
  skewX(c) 
  scaleY(d) 
  translateX(tx) 
  translateY(ty);
        </pre>
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 800px;
      }
      
      .cards-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      
      .card {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 1rem;
        width: 200px;
        height: 150px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        transition: transform 0.3s ease;
      }
      
      .matrix-info {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
      }
      
      pre {
        background-color: #f1f1f1;
        padding: 0.5rem;
        border-radius: 4px;
        overflow-x: auto;
      }
      
      /* TODO: Add matrix transform styles for each card */
    </style>
  </template>
}

<template>
  <h2>CSS Matrix Transforms Demo</h2>
  <MatrixTransforms />
</template>
