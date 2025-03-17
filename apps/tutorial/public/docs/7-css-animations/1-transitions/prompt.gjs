import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

class TransitionDemo extends Component {
  @tracked isExpanded = false;
  
  @action
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  <template>
    <div class="demo-container">
      <button class="demo-button" {{on "click" this.toggleExpand}}>
        {{if this.isExpanded "Collapse" "Expand"}}
      </button>
      
      <div class="card">
        <div class="card-content">
          <h3>Hover over me</h3>
          <p>This card should scale slightly on hover</p>
        </div>
      </div>
      
      <div class="expandable-section {{if this.isExpanded "expanded"}}">
        <p>This section expands and collapses with a smooth transition</p>
        <p>The height should animate smoothly</p>
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 500px;
      }
      
      .demo-button {
        padding: 0.5rem 1rem;
        background-color: #0078e7;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-bottom: 1rem;
        /* TODO: Add transition for color change on hover */
      }
      
      .demo-button:hover {
        background-color: #005bb5;
      }
      
      .card {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 1rem;
        margin-bottom: 1rem;
        cursor: pointer;
        /* TODO: Add transition for transform on hover */
      }
      
      .card:hover {
        /* TODO: Add transform scale effect */
      }
      
      .expandable-section {
        background-color: #f0f0f0;
        border-radius: 4px;
        padding: 0 1rem;
        overflow: hidden;
        height: 0;
        /* TODO: Add transition for height change */
      }
      
      .expandable-section.expanded {
        height: auto;
        padding: 1rem;
      }
    </style>
  </template>
}

<template>
  <h2>CSS Transitions Demo</h2>
  <TransitionDemo />
</template>
