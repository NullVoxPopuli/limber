import { isDevelopingApp, macroCondition } from '@embroider/macros';

import { notInIframe } from 'ember-primitives/iframe';
import { getCompiler } from 'ember-repl';
import { resource } from 'ember-resources';
import { connectToParent } from 'penpal';

import { serializeDeps, type Versions } from 'limber/utils/dependencies';

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
      update(data: { format: FormatQP; code: string; versions?: Versions }) {
        const { format, code: text, versions } = data;
        const editor = owner.lookup('service:editor');

        /**
         * The output compiles against the pins in this page's URL.
         * The URL write of `editor.update` keeps the other query params.
         */
        if (versions) {
          const router = owner.lookup('service:router');
          const deps = serializeDeps(versions);

          if (deps !== serializeDeps(editor.versions)) {
            const url = new URL(router.currentURL ?? '/output', location.origin);

            url.searchParams.set('deps', deps ?? '');
            router.replaceWith(url.pathname + url.search);
          }
        }

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
