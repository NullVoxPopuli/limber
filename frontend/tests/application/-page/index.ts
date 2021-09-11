import { PageObject } from 'fractal-page-object';

import { s } from './-helpers';
import { DemoSelect } from './demo-select';
import { Editor } from './editor';
import { Nav } from './nav';
import { OutputArea } from './output';

export class Page extends PageObject {
  nav = s('navigation', Nav);
  out = s('output', OutputArea);
  editor = s('editor-panel', Editor);
  demo = s('demo-select', DemoSelect);

  selectDemo(text: string) {
    return this.demo.select(text);
  }
}
