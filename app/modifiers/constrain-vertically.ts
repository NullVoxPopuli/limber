import { debounce } from '@ember/runloop';

import { modifier } from 'ember-could-get-used-to-this';

export default modifier(function constraintVertically(element) {
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

  element.setAttribute('style', `max-height: calc(100vh - ${offset}px)`);
}
