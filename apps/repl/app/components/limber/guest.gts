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
        console.log('update', format, text);
        let editor = owner.lookup('service:editor');

        editor.updateDemo(text, format);
      }
    }
  });

  on.cleanup(() => connection.destroy());

  return '';
});

<template>
  {{guestFrame}}
</template>
