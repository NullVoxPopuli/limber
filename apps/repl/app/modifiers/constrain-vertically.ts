import { debounce } from '@ember/runloop';
import { isTesting } from '@embroider/macros';

import { modifier } from 'ember-modifier';

export default modifier((element) => {
  const debouncedConstrain = () => constrain(element);
  // eslint-disable-next-line ember/no-runloop
  const x = () => debounce(debouncedConstrain, 10);

  constrain(element);
  window.addEventListener('resize', x);

  return () => {
    window.removeEventListener('resize', x);
  };
});

function constrain(
  element: Pick<HTMLElement, 'getBoundingClientRect' | 'setAttribute'>
) {
  let offset = element.getBoundingClientRect().y;

  /**
   * Improve scaled debug window
   */
  if (isTesting()) {
    const container = document.querySelector('#ember-testing');
    const containerOffset = container?.getBoundingClientRect()?.y ?? 0;

    offset -= containerOffset;
  }

  element.setAttribute('style', `max-height: calc(100vh - ${offset}px)`);
}
