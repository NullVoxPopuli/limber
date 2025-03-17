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
          class="card card1 {{if (eq this.activeCard 'card1') 'active'}}" 
          {{on "mouseenter" (fn this.setActiveCard 'card1')}}
          {{on "mouseleave" this.resetActiveCard}}
        >
          <h3>Rotation Transform</h3>
          <p>This card should rotate on hover</p>
        </div>
        
        <div 
          class="card card2 {{if (eq this.activeCard 'card2') 'active'}}" 
          {{on "mouseenter" (fn this.setActiveCard 'card2')}}
          {{on "mouseleave" this.resetActiveCard}}
        >
          <h3>Skew Transform</h3>
          <p>This card should skew on hover</p>
        </div>
        
        <div 
          class="card card3 {{if (eq this.activeCard 'card3') 'active'}}" 
          {{on "mouseenter" (fn this.setActiveCard 'card3')}}
          {{on "mouseleave" this.resetActiveCard}}
        >
          <h3>Combined Transform</h3>
          <p>This card should translate and scale on hover</p>
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
      
      /* Rotation transform */
      .card1.active {
        transform: rotate(15deg);
      }
      
      /* Skew transform */
      .card2.active {
        transform: skew(10deg, 5deg);
      }
      
      /* Combined transform */
      .card3.active {
        transform: translateY(-10px) scale(1.1);
      }
    </style>
  </template>
}

<template>
  <h2>CSS Transforms Demo</h2>
  <TransformDemo />
</template>
