import { debounce } from '@ember/runloop';
import { isTesting } from '@embroider/macros';

import { modifier } from 'ember-modifier';

interface Signature {
  Element: HTMLElement;
}

export default modifier<Signature>((element: HTMLElement) => {
  let debouncedConstrain = () => constrain(element);
  let x = () => debounce(debouncedConstrain, 10);

  constrain(element);
  window.addEventListener('resize', x);

  return () => {
    window.removeEventListener('resize', x);
  };
});

function constrain(element: HTMLElement) {
  let offset = element.getBoundingClientRect().y;

  /**
   * Improve scaled debug window
   */
  if (isTesting()) {
    let container = document.querySelector('#ember-testing');
    let containerOffset = container?.getBoundingClientRect()?.y ?? 0;

    offset -= containerOffset;
  }

  element.setAttribute('style', `max-height: calc(100vh - ${offset}px)`);
}
