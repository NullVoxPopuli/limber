// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { DEBUG } from '@glimmer/env';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

import { notInIframe } from 'limber/helpers/in-iframe';

import type EditorService from 'limber/services/editor';

export default class ApplicationRoute extends Route {
  @service declare editor: EditorService;

  async beforeModel() {
    await this.editor.auth.check();

    document.querySelector('#initial-loader')?.remove();

    if (DEBUG) {
      if (notInIframe()) {
        await setupDebugTools();
      }
    }
  }
}

async function setupDebugTools() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let w = window as any;

  console.info(
    `Welcome intrepid debugger!\n` +
      `\n` +
      `To see what debug tools are available, interact with the \`window.limber\` object.` +
      `\n\n` +
      `for example: \n\n` +
      `\twindow.limber.inspectStatecharts(); // only available in development builds`
  );

  let { inspect } = await import('@xstate/inspect');

  let qp = new URLSearchParams(window.location.href);

  if (qp.get('xstate-inspect') == 'true') {
    inspect({ iframe: false });
  }

  w.limber = {
    inspectStatecharts: () => {
      qp.set('xstate-inspect', 'true');

      window.location.href = qp.toString();
    },
  };
}
