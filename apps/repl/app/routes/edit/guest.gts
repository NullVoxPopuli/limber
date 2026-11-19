import { isDevelopingApp, macroCondition } from '@embroider/macros';

import { notInIframe } from 'ember-primitives/iframe';
import { getCompiler } from 'ember-repl';
import { resource } from 'ember-resources';
import { connectToParent } from 'penpal';

import { formatFrom } from '#app/languages.gts';

import { serializeDeps } from 'limber/utils/dependencies';

import type { FrameDocument, GuestMethods, HostMethods } from 'limber-ui';

const guestFrame = resource(({ on, owner }) => {
  /**
   * Don't do anything if we aren't in an iframe.
   * (less work = faster ready state)
   */
  if (notInIframe()) {
    return '';
  }

  const connection = connectToParent<HostMethods>({
    methods: {
      update({ format, code, versions, shadowdom, files }: FrameDocument) {
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

        editor.update(
          code,
          formatFrom(format),
          shadowdom === undefined ? undefined : { shadowdom: String(shadowdom) },
          files
        );
      },
    } satisfies GuestMethods,
  });

  /**
   * The edit page lists these when it frames this page with a pinned ember-source.
   *
   * This runs before the first compile, which comes after the render.
   */
  const stop = getCompiler(owner).onDependencies((entries) => {
    void connection.promise.then((parent) => parent.dependencies(entries));
  });

  if (macroCondition(isDevelopingApp())) {
    connection.promise.then(() => {
      console.debug('Guest connected to Host');
    });
  }

  on.cleanup(() => {
    stop();
    connection.destroy();
  });

  return '';
});

<template>{{guestFrame}}</template>
