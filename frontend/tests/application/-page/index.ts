import { select } from '@ember/test-helpers';

import { PageObject } from 'fractal-page-object';

import { dt, s } from './-helpers';
import { Editor } from './editor';
import { Nav } from './nav';
import { OutputArea } from './output';

export class Page extends PageObject {
  nav = s('navigation', Nav);
  out = s('output', OutputArea);
  editor = s('editor-panel', Editor);

  async selectDemo(label: string) {
    await select(dt('demo-select'), label);
  }
}
