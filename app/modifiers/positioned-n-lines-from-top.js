import { modifier } from 'ember-could-get-used-to-this';

export default modifier(function positionFromTop(element, [lines, padding]) {
  let container = element.parentElement;
  let lineHeight = getComputedStyle(container).lineHeight;

  element.setAttribute('style', `top: calc(${padding} + ${lineHeight} * ${lines - 1})`);
});
