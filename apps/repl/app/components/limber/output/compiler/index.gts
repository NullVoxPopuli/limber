import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import { schedule } from '@ember/runloop';
import { service } from '@ember/service';
import { waitFor } from '@ember/test-waiters';

import { getCompiler } from 'ember-repl';

import CopyMenu from 'limber/components/limber/copy-menu';

import type { MessagingAPI, Parent } from '../frame-messaging';
import type Owner from '@ember/owner';
import type RouterService from '@ember/routing/router-service';
import type { ComponentLike } from '@glint/template';
import type { Format } from 'limber/utils/messaging';

interface Signature {
  Args: {
    messagingAPI: MessagingAPI;
  };
  Blocks: {
    default: [
      {
        component: ComponentLike<never> | undefined;
        format: Format | undefined;
      },
    ];
  };
}

/**
 * The Receiving Component is Limber::FrameOutput
 */
export default class Compiler extends Component<Signature> {
  <template>{{yield (hash component=this.component format=this.format)}}</template>

  @service declare router: RouterService;

  @tracked component?: ComponentLike<never>;
  @tracked error: string | null = null;
  @tracked errorLine: number | null = null;
  @tracked template?: unknown;
  /**
   * Used for changing default styles, if needed
   */
  @tracked format?: Format;

  declare parentFrame: Parent;

  constructor(owner: Owner, args: Signature['Args']) {
    super(owner, args);

    const api = args.messagingAPI;

    api.onReceiveText((format: Format, text) => this.makeComponent(format, text));
    api.onConnect((parent) => (this.parentFrame = parent));
  }

  onCompileStart = async () => {
    await this.parentFrame.beginCompile();
  };

  onError = async (error: string) => {
    console.error(error);
    await this.parentFrame.error({ error });
  };

  @action
  @waitFor
  async makeComponent(format: Format, text: string) {
    const onSuccess = async (component: ComponentLike) => {
      if (!component) {
        await this.parentFrame.error({ error: 'could not build component' });

        return;
      }

      if (isDestroyed(this) || isDestroying(this)) return;

      this.component = component as ComponentLike<never>;
      this.format = format;

      await this.parentFrame.success();

      // eslint-disable-next-line ember/no-runloop
      schedule('afterRender', () => {
        if (isDestroyed(this) || isDestroying(this)) return;

        this.parentFrame.finishedRendering();
      });
    };

    const compiler = getCompiler(this);

    switch (format) {
      case 'glimdown':
        return await compiler.compileMD(text, {
          CopyComponent: '<CopyMenu />',
          topLevelScope: {
            CopyMenu: CopyMenu,
          },
          onCompileStart: this.onCompileStart,
          onSuccess,
          onError: this.onError,
        });

      case 'gjs':
        return await compiler.compileGJS(text, {
          onCompileStart: this.onCompileStart,
          onSuccess,
          onError: this.onError,
        });
      case 'hbs':
        return await compiler.compileHBS(text, {
          topLevelScope: {
            CopyMenu: CopyMenu,
          },
          onCompileStart: this.onCompileStart,
          onSuccess,
          onError: this.onError,
        });
    }
  }
}
