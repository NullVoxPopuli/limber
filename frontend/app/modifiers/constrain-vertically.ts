import { debounce } from '@ember/runloop';

export default function constraintVertically(element: HTMLElement) {
  let debouncedConstrain = () => constrain(element);
  let x = () => debounce(debouncedConstrain, 10);

  constrain(element);
  window.addEventListener('resize', x);

  return () => {
    window.removeEventListener('resize', x);
  };
}

function constrain(element: HTMLElement) {
  let offset = element.getBoundingClientRect().y;

  element.setAttribute('style', `max-height: calc(100vh - ${offset}px)`);
}
