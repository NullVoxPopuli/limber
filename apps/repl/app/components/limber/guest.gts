import { resource } from 'ember-resources';
import { connectToParent } from 'penpal';

import type { Format } from 'limber/utils/messaging';

interface ParentMethods {
  ready: () => void;
}

const guestFrame = resource(({ on, owner }) => {
  let connection = connectToParent<ParentMethods>({
    methods: {
      update(format: Format, text: string) {
        let editor = owner.lookup('service:editor');

        editor.updateDemo(text, format);
      }
    }
  });

  on.cleanup(() => connection.destroy());

  (async () => {
    await connection.promise;
  })()

  return '';
});

<template>
  {{guestFrame}}
</template>
