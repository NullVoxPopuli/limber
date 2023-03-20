import { resource } from 'ember-resources';
import { connectToParent } from 'penpal';
import { isDevelopingApp, macroCondition } from '@embroider/macros';

import { notInIframe } from 'limber/helpers/in-iframe';

import type { Format } from 'limber/utils/messaging';

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

  let connection = connectToParent<ParentMethods>({
    methods: {
      update(format: Format, text: string) {
        let editor = owner.lookup('service:editor');

        editor.updateDemo(text, format);
      }
    }
  });

  if (macroCondition(isDevelopingApp())) {
    connection.promise.then(() => {
      console.log('Guest connected to Host');
    });
  }

  on.cleanup(() => connection.destroy());

  return '';
});

<template>
  {{guestFrame}}
</template>
