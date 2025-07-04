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
    {
      c,
      t,
      format,
      checks,
    }: { t?: string; c?: string; format?: string; checks?: { aborted?: boolean } } = {}
  ) {
    // let sawExpectedError = false;

    const _checks = {
      aborted: checks?.aborted ?? true,
    };

    try {
      await visit(to);
    } catch (e) {
      assert('Expected error to be an object', typeof e === 'object' && e !== null);
      assert(
        'Expected error to have a message property',
        'message' in e && typeof e.message === 'string'
      );

      const lines = e.message.split('\n');
      const first = lines[0];

      assert(
        `The only expected error is a TransitionAborted. Received: ${first}`,
        first === 'TransitionAborted'
      );
      // sawExpectedError = true;
    }

    if (_checks.aborted) {
      // assert(
      //   `Expected to see a TransitionAborted error, but it did not occur. currentURL: ${currentURL()}`,
      //   sawExpectedError
      // );
    }

    // Allow time for transitions to settle
    await settled();

    const url = currentURL();

    assert(`Expected an URL -- via currentURL(), got ${url}`, url);

    const [, search] = url.split('?');
    const query = new URLSearchParams(search);

    if (format) {
      const f = query.get('format');

      assert(`Expected format, ${format}, but got ${f}`, f === format);
    }

    if (c) {
      const lzString = query.get('c');

      assert(`Missing c query param. currentURL: ${url}`, lzString);

      const value = decompressFromEncodedURIComponent(lzString);

      assert(`QP's c did not match expected text`, c === value);
    }

    if (t) {
      const text = query.get('t');

      assert(`QP's t did not match expected text`, text === t);
    }
  }
}
