import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

// Helper function to find DOM elements
const findElement = (selector) => document.querySelector(selector);

// Ensure we have a modal container in the DOM
if (!findElement('#modal-container')) {
  const modalContainer = document.createElement('div');
  modalContainer.id = 'modal-container';
  document.body.appendChild(modalContainer);
}

class Modal extends Component {
  @action
  closeModal() {
    if (this.args.onClose) {
      this.args.onClose();
    }
  }

  <template>
    {{#in-element (findElement '#modal-container')}}
      <div class="modal-backdrop" {{on "click" this.closeModal}}>
        <div class="modal-content" {{on "click" (e => e.stopPropagation())}}>
          {{yield}}
        </div>
      </div>
    {{/in-element}}
  </template>
}

class ModalDemo extends Component {
  @tracked isModalOpen = false;

  @action
  openModal() {
    this.isModalOpen = true;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
  }

  <template>
    <button {{on "click" this.openModal}}>Open Modal</button>

    {{#if this.isModalOpen}}
      <Modal @onClose={{this.closeModal}}>
        <h2>Modal Title</h2>
        <p>This is a modal dialog. Click outside to close.</p>
        <button {{on "click" this.closeModal}}>Close</button>
      </Modal>
    {{/if}}

    <style>
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 4px;
        max-width: 80%;
        max-height: 80%;
        overflow: auto;
      }
    </style>
  </template>
}

<template>
  <ModalDemo />
</template>
