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
        console.log(format, text)
        editor.updateDemo(text, format);
      }
    }
  });

  on.cleanup(() => connection.destroy());

  (async () => {
    let parent = await connection.promise;

    await parent.ready();
  })()

  // return connection;
  return '';
});

<template>
  {{guestFrame}}
</template>
