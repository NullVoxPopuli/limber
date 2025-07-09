import { sentenceCase } from 'change-case';

export default function render(element) {
  element.textContent = sentenceCase('helloThere');
}
