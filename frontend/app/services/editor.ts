import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { associateDestroyableChild } from '@ember/destroyable';
import { action } from '@ember/object';
import { getOwner,setOwner } from '@ember/owner';
import Service, { inject as service } from '@ember/service';

import { TextURIComponent } from 'limber/utils/editor-text';

import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

interface Descriptor {
  initializer: () => unknown;
}

function link(_prototype: object, key: string, descriptor?: Descriptor): void {
  if (!descriptor) return;

  assert(`@link can only be used with string-keys`, typeof key === 'string');


  let { initializer } = descriptor;

  assert(
    `@link may only be used on initialized properties. For example, ` +
      `\`@link foo = new MyClass();\``,
    initializer
  );


  let caches = new WeakMap<object, any>();

  // https://github.com/pzuraq/ember-could-get-used-to-this/blob/master/addon/index.js
  return {
    get(this: object) {
      let child = caches.get(this);

      if (!child) {
        child = initializer.call(this);

        associateDestroyableChild(this, child);

        let owner = getOwner(this);

        if (owner) {
          setOwner(child, owner);
        }

        caches.set(this, child);
        assert(`Failed to create cache for internal resource configuration object`, child);
      }

      return child;
    },
  } as unknown as void /* Thanks TS. */;
}

export default class EditorService extends Service {
  @service declare router: RouterService;

  @tracked isCompiling = false;
  @tracked error?: string;
  @tracked errorLine?: number;
  @tracked scrollbarWidth = 0;

  @link textURIComponent = new TextURIComponent();

  @action
  updateText(text: string) {
    this.textURIComponent.queue(text);
  }

  get text() {
    return this.textURIComponent.decoded;
  }

  _editorSwapText?: (text: string, format: Format) => void;

  @action
  updateDemo(text: string, format: Format) {
    // Updates the editor
    this._editorSwapText?.(text, format);

    // Update ourselves
    this.textURIComponent.set(text, format);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    editor: EditorService;
  }
}
