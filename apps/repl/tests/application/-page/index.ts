import { assert } from '@ember/debug';
import { currentURL, settled, visit } from '@ember/test-helpers';

import { PageObject } from 'fractal-page-object';
import { decompressFromEncodedURIComponent } from 'lz-string';

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

  async expectRedirectToContent(
    to: string,
    { c, t, format }: { t?: string; c?: string; format?: string } = {}
  ) {
    let sawExpectedError = false;

    try {
      await visit(to);
    } catch (e) {
      assert('Expected error to be an object', typeof e === 'object' && e !== null);
      assert(
        'Expected error to have a message property',
        'message' in e && typeof e.message === 'string'
      );

      let lines = e.message.split('\n');
      let first = lines[0];

      assert(
        `The only expected error is a TransitionAborted. Received: ${first}`,
        first === 'TransitionAborted'
      );
      sawExpectedError = true;
    }

    assert(`Expected to see a TransitionAborted error, but it did not occur.`, sawExpectedError);

    // Allow time for transitions to settle
    await settled();

    let url = currentURL();

    assert(`Expected an URL -- via currentURL(), got ${url}`, url);

    let [, search] = url.split('?');
    let query = new URLSearchParams(search);

    if (format) {
      let f = query.get('format');

      assert(`Expected format, ${format}, but got ${f}`, f === format);
    }

    if (c) {
      let lzString = query.get('c');

      assert(`Missing c query param`, lzString);

      let value = decompressFromEncodedURIComponent(lzString);

      assert(`QP's c did not match expected text`, c === value);
    }

    if (t) {
      let text = query.get('t');

      assert(`QP's t did not match expected text`, text === t);
    }
  }
}
