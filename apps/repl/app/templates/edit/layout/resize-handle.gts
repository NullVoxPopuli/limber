import { registerDestructor } from '@ember/destroyable';

import Modifier from 'ember-modifier';

import type { TOC } from '@ember/component/template-only';

const eq = (a: string, b: string) => a === b;

class ResizePrevious extends Modifier<{ Args: { Positional: [string] } }> {
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
    // Is this a valid warning?

    this.editor = element.parentElement!.previousElementSibling! as HTMLElement;

    if (!this.isSetup) {
      this.isSetup = true;
      this.dragSurface = document.createElement('div');
      this.dragSurface.classList.add('fixed', 'inset-0');
      this.setup();
    }
  }

  setup = () => {
    this.dragHandle.addEventListener('touchstart', this.dragStartHandler, { passive: true });
    this.dragHandle.addEventListener('mousedown', this.dragStartHandler, { passive: true });
    this.dragHandle.addEventListener('keydown', this.keyHandler, { passive: true });

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

  setPosition = (event: MouseEvent | PointerEvent | TouchEvent) => {
    if ('TouchEvent' in window && event instanceof TouchEvent && event.touches[0]) {
      this.pointerX = event.touches[0].clientX;
      this.pointerY = event.touches[0].clientY;
    } else if (event instanceof PointerEvent || event instanceof MouseEvent) {
      this.pointerX = event.clientX;
      this.pointerY = event.clientY;
    }
  };

  queueUpdate = () => {
    cancelAnimationFrame(this.dragFrame);
    this.dragFrame = requestAnimationFrame(() => {
      const box = this.editor.getBoundingClientRect();

      if (this.direction === 'horizontal') {
        this.editor.style.width = `${this.pointerX - box.x}px`;
      } else {
        this.editor.style.height = `${this.pointerY - box.y}px`;
      }
    });
  };

  dragEndHandler = () => {
    this.dragging = false;
    this.queueUpdate();
    this.dragSurface.remove();
    enableOverscroll();

    /**
     * No need to listen if we aren't dragging
     */
    window.removeEventListener('touchmove', this.dragMove);
    window.removeEventListener('touchend', this.dragEndHandler);
    window.removeEventListener('mousemove', this.dragMove);
    window.removeEventListener('mouseup', this.dragEndHandler);
  };

  dragMove = (event: MouseEvent | PointerEvent | TouchEvent) => {
    if (!this.dragging) return;
    this.setPosition(event);
    this.queueUpdate();
  };

  dragStartHandler = (event: MouseEvent | PointerEvent | TouchEvent) => {
    this.dragging = true;
    if (event.target !== this.dragHandle) return;
    document.body.appendChild(this.dragSurface);
    disableOverscroll();

    this.setPosition(event);

    window.addEventListener('touchend', this.dragEndHandler, { passive: true });
    window.addEventListener('touchmove', this.dragMove, { passive: true });
    window.addEventListener('mousemove', this.dragMove, { passive: true });
    window.addEventListener('mouseup', this.dragEndHandler, { passive: true });
  };

  keyHandler = (event: KeyboardEvent) => {
    const deltaT = new Date().getTime() - this.lastKey;
    const isRapid = deltaT < 50;

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
      const box = this.editor.getBoundingClientRect();

      if (this.direction === 'horizontal') {
        this.editor.style.width = `calc(${box.width}px + ${this.keyDistance}rem)`;
      } else {
        this.editor.style.height = `calc(${box.height}px + ${this.keyDistance}rem)`;
      }

      this.keyDistance = 0;
    });
  };
}

/**
 * You have to put it on <html> and <body> because
 * in Chrome it only works on the <body> and in Safari only on the <html> element
 * (tested on Android 12 Chrome, FF, Samsung Internet and Safari 16 on iOS).
 *
 * Please don't disable this feature by default, only when it's beneficial to your users.
 *
 * https://www.matuzo.at/blog/2022/100daysof-day53/
 */
function enableOverscroll() {
  document.body.style.overscrollBehavior = previousBodyOverScroll;
  document.documentElement.style.overscrollBehavior = previousHTMLOverScroll;
}

let previousBodyOverScroll: string;
let previousHTMLOverScroll: string;

function disableOverscroll() {
  previousBodyOverScroll ||= document.body.style.overscrollBehavior;
  previousHTMLOverScroll ||= document.documentElement.style.overscrollBehavior;

  document.body.style.overscrollBehavior = 'none';
  document.documentElement.style.overscrollBehavior = 'none';
}

export const ResizeHandle: TOC<{
  Args: {
    direction: 'vertical' | 'horizontal';
  };
}> = <template>
  <div class="relative {{if (eq @direction 'horizontal') 'h-full w-2 py-2' 'h-2 w-full px-2'}} ">
    <button
      class="{{if
          (eq @direction 'horizontal')
          'h-full w-2 cursor-col-resize py-2'
          'h-2 w-full cursor-row-resize px-2'
        }}
        bg-horizon-lavender group absolute inset-0 flex items-end justify-end leading-4 text-white shadow focus:outline-none focus:ring-4 focus-visible:outline-none"
      {{! template-lint-disable no-inline-styles }}
      style="text-shadow: 1px 1px 1px black"
      aria-label="resize the editor"
      type="button"
      {{! @glint-ignore }}
      {{ResizePrevious @direction}}
    >
      <span class="group-focus:animate-bounce">
        {{if (eq @direction "horizontal") "⬌" "⬍"}}
      </span>
    </button>
  </div>
</template>;
