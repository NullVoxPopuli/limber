import { isDevelopingApp, macroCondition } from '@embroider/macros';

import { notInIframe } from 'ember-primitives/iframe';
import { getCompiler } from 'ember-repl';
import { resource } from 'ember-resources';
import { connectToParent } from 'penpal';

import type { FormatQP } from '#app/languages.gts';

interface ParentMethods {
  ready: () => void;
}

const guestFrame = resource(({ on, owner }) => {
  /**
   * Don't do anything if we aren't in an iframe.
   * (less work = faster ready state)
   */
  if (notInIframe()) {
    return '';
  }

  const connection = connectToParent<ParentMethods>({
    methods: {
      update(data: { format: FormatQP; code: string }) {
        const { format, code: text } = data;
        const editor = owner.lookup('service:editor');
        //       const router = owner.lookup('service:router');
        //
        // console.log(router.currentURL)

        editor.update(text, format);
      },
      /**
       * The edit page asks for these when it frames this page with a pinned ember-source.
       */
      dependencies() {
        return Array.from(getCompiler(owner).dependencies);
      },
    },
  });

  if (macroCondition(isDevelopingApp())) {
    connection.promise.then(() => {
      console.debug('Guest connected to Host');
    });
  }

  on.cleanup(() => connection.destroy());

  return '';
});

<template>{{guestFrame}}</template>
