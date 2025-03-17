import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class TransformDemo extends Component {
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
          <h3>Rotation Transform</h3>
          <p>This card should rotate on hover</p>
          <!-- TODO: Add rotation transform in CSS -->
        </div>
        
        <div 
          class="card {{if (eq this.activeCard 'card2') 'active'}}" 
          {{on "mouseenter" (fn this.setActiveCard 'card2')}}
          {{on "mouseleave" this.resetActiveCard}}
        >
          <h3>Skew Transform</h3>
          <p>This card should skew on hover</p>
          <!-- TODO: Add skew transform in CSS -->
        </div>
        
        <div 
          class="card {{if (eq this.activeCard 'card3') 'active'}}" 
          {{on "mouseenter" (fn this.setActiveCard 'card3')}}
          {{on "mouseleave" this.resetActiveCard}}
        >
          <h3>Combined Transform</h3>
          <p>This card should translate and scale on hover</p>
          <!-- TODO: Add combined transform in CSS -->
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
      
      /* TODO: Add transform styles for each card */
    </style>
  </template>
}

<template>
  <h2>CSS Transforms Demo</h2>
  <TransformDemo />
</template>
