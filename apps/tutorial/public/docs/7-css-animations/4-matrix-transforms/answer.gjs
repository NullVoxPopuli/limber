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
          class="card card1 {{if (eq this.activeCard 'card1') 'active'}}" 
          {{on "mouseenter" (fn this.setActiveCard 'card1')}}
          {{on "mouseleave" this.resetActiveCard}}
        >
          <h3>Rotation + Scale</h3>
          <p>This card should rotate and scale using a matrix transform</p>
        </div>
        
        <div 
          class="card card2 {{if (eq this.activeCard 'card2') 'active'}}" 
          {{on "mouseenter" (fn this.setActiveCard 'card2')}}
          {{on "mouseleave" this.resetActiveCard}}
        >
          <h3>Perspective Effect</h3>
          <p>This card should have a perspective effect using a matrix transform</p>
        </div>
        
        <div 
          class="card card3 {{if (eq this.activeCard 'card3') 'active'}}" 
          {{on "mouseenter" (fn this.setActiveCard 'card3')}}
          {{on "mouseleave" this.resetActiveCard}}
        >
          <h3>Reflection Effect</h3>
          <p>This card should have a reflection effect using a matrix transform</p>
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
        
        <div class="matrix-examples">
          <h5>Matrix Examples Used:</h5>
          <ul>
            <li><strong>Rotation + Scale:</strong> matrix(0.866, 0.5, -0.5, 0.866, 0, 0) * matrix(1.5, 0, 0, 1.5, 0, 0)</li>
            <li><strong>Perspective:</strong> matrix(1, 0, 0.5, 1, 0, 0)</li>
            <li><strong>Reflection:</strong> matrix(1, 0, 0, -1, 0, 0)</li>
          </ul>
        </div>
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
      
      /* Rotation + Scale Matrix Transform */
      .card1.active {
        /* Rotate 30 degrees and scale by 1.5 */
        transform: matrix(1.299, 0.75, -0.75, 1.299, 0, 0);
      }
      
      /* Perspective Effect Matrix Transform */
      .card2.active {
        /* Perspective effect by skewing horizontally */
        transform: matrix(1, 0, 0.5, 1, 0, 0);
      }
      
      /* Reflection Effect Matrix Transform */
      .card3.active {
        /* Reflect vertically */
        transform: matrix(1, 0, 0, -1, 0, 150);
      }
      
      .matrix-info {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
      }
      
      .matrix-examples {
        margin-top: 1rem;
      }
      
      pre {
        background-color: #f1f1f1;
        padding: 0.5rem;
        border-radius: 4px;
        overflow-x: auto;
      }
    </style>
  </template>
}

<template>
  <h2>CSS Matrix Transforms Demo</h2>
  <MatrixTransforms />
</template>
