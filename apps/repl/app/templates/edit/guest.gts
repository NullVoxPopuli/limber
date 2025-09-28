import { isDevelopingApp, macroCondition } from '@embroider/macros';

import { notInIframe } from 'ember-primitives/iframe';
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
      update(data: { format: FormatQP; text: string }) {
        const { format, text } = data;
        const editor = owner.lookup('service:editor');
        //       const router = owner.lookup('service:router');
        //
        // console.log(router.currentURL)

        // console.debug(`Update received`, { format, text }, 'existing', {
        //   format: editor.format,
        //   text: editor.text,
        // });
        if (format) editor.updateFormat(format);
        if (text) editor.updateText(text);
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
