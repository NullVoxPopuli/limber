import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

import type { TOC } from '@ember/component/template-only';

const eq = (a: string, b: string) => a === b;

class ResizePrevious extends Modifier<{ Args: { Positional: [string] }}> {
  declare editor: HTMLElement;
  declare dragHandle: HTMLElement;
  declare direction: string;

  /**
    * iFrames eat pointer events, so when we drag, we need to cover
    * the iframe until we let go
    */
  declare dragSurface: HTMLElement;

  // Pointer
  pointerX = 0;
  pointerY = 0;
  dragging = false;
  declare dragFrame: number;

  // Keyboard
  keyDistance = 0;
  declare keyFrame: number; // ha
  declare lastKey: number;

  isSetup = false;
  modify(element: Element, [direction]: [string]) {
    this.direction = direction;
    this.dragHandle = element as HTMLElement;
    this.editor = element.parentElement!.previousElementSibling! as HTMLElement;

    if (!this.isSetup) {
      this.isSetup = true;
      this.dragSurface = document.createElement('div');
      this.dragSurface.classList.add('fixed', 'inset-0');
      this.setup();
    }
  }

  setup = () => {
    this.dragHandle.addEventListener('touchstart', this.dragStartHandler);
    this.dragHandle.addEventListener('mousedown', this.dragStartHandler);
    this.dragHandle.addEventListener('keydown', this.keyHandler);

    registerDestructor(this, () => {
      this.dragHandle.removeEventListener('touchstart', this.dragStartHandler);
      this.dragHandle.removeEventListener('mousedown', this.dragStartHandler);
      window.removeEventListener('touchmove', this.dragMove);
      window.removeEventListener('touchend', this.dragEndHandler);
      window.removeEventListener('mousemove', this.dragMove);
      window.removeEventListener('mouseup', this.dragEndHandler);
      this.dragHandle.removeEventListener('keydown', this.keyHandler);
    });
  };

  setPosition = (event: PointerEvent) => {
    if ('TouchEvent' in window && event instanceof TouchEvent) {
      this.pointerX = event.touches[0].clientX;
      this.pointerY = event.touches[0].clientY;
    } else {
      this.pointerX = event.clientX;
      this.pointerY = event.clientY;
    }
  }

  queueUpdate = () => {
    cancelAnimationFrame(this.dragFrame);
    this.dragFrame = requestAnimationFrame(() => {
      let box = this.editor.getBoundingClientRect();

      if (this.direction === 'horizontal') {
        this.editor.style.width = `${this.pointerX - box.x}px`;
      } else {
        this.editor.style.height = `${this.pointerY - box.y}px`;
      }
    });
  }

  dragEndHandler = () => {
    this.dragging = false;
    this.queueUpdate();
    this.dragSurface.remove();

    /**
      * No need to listen if we aren't dragging
      */
    window.removeEventListener('touchmove', this.dragMove);
    window.removeEventListener('touchend', this.dragEndHandler);
    window.removeEventListener('mousemove', this.dragMove);
    window.removeEventListener('mouseup', this.dragEndHandler);
  }

  dragMove = (event: PointerEvent) => {
    if (!this.dragging) return;
    this.setPosition(event);
    this.queueUpdate();
  }

  dragStartHandler = (event: PointerEvent) => {
    this.dragging = true;
    if (event.target !== this.dragHandle) return;
    document.body.appendChild(this.dragSurface);

    this.setPosition(event);

    window.addEventListener('touchend', this.dragEndHandler);
    window.addEventListener('touchmove', this.dragMove);
    window.addEventListener('mousemove', this.dragMove);
    window.addEventListener('mouseup', this.dragEndHandler);
  }

  keyHandler = (event: KeyboardEvent) => {
    let deltaT = new Date().getTime() - this.lastKey;
    let isRapid = deltaT < 50;
    if (event.code === 'ArrowDown' || event.code === 'ArrowRight') {
      this.keyDistance += isRapid ? 8 : 1;
      this.lastKey = new Date().getTime();
    }

    if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') {
      this.keyDistance -= isRapid ? 8 : 1;
      this.lastKey = new Date().getTime();
    }

    cancelAnimationFrame(this.keyFrame);
    this.keyFrame = requestAnimationFrame(() => {
      let box = this.editor.getBoundingClientRect();

      if (this.direction === 'horizontal') {
        this.editor.style.width = `calc(${box.width}px + ${this.keyDistance}rem)`;
      } else {
        this.editor.style.height = `calc(${box.height}px + ${this.keyDistance}rem)`;
      }
      this.keyDistance = 0;
    });
  }
}

export const ResizeHandle: TOC<{
  Args: {
    direction: 'vertical' | 'horizontal';
  }
}> = <template>
  <div class="
    relative
    {{if (eq @direction 'horizontal')
      "h-full w-2 py-2"
      "w-full h-2 px-2"
    }}
  ">
    <button
      class="
        {{if (eq @direction 'horizontal')
          "h-full w-2 py-2 cursor-col-resize"
          "w-full h-2 px-2 cursor-row-resize"
        }}
        absolute inset-0
        flex justify-end items-end
        text-white bg-horizon-lavender
        focus:ring-4 focus:outline-none focus-visible:outline-none
        leading-4 shadow z-10
        group
      "
    style="text-shadow: 1px 1px 1px black"
    aria-label="resize the editor"
    {{! @glint-ignore }}
    {{ResizePrevious @direction}}
    >
      <span class="group-focus:animate-bounce">
        {{if (eq @direction 'horizontal') '⬌' '⬍'}}
      </span>
    </button>
  </div>
</template>;
