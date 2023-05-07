import Component from '@glimmer/component';
import { schedule } from '@ember/runloop';
import { hash } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { waitFor } from '@ember/test-waiters';

import { Format } from 'limber/utils/messaging';

import { compileTopLevelComponent } from './create-top-level-component';

import type { ComponentLike } from '@glint/template';
import type RouterService from '@ember/routing/router-service';
import type { MessagingAPI, Parent } from '../frame-messaging';

interface Signature {
  Args: {
    messagingAPI: MessagingAPI;
  };
  Blocks: {
    default: [
      {
        component: ComponentLike<never> | undefined;
        format: Format | undefined;
      }
    ];
  };
}

/**
 * The Receiving Component is Limber::FrameOutput
 */
export default class Compiler extends Component<Signature> {
  <template>
    {{yield (hash component=this.component format=this.format)}}
  </template>

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

  constructor(owner: unknown, args: Signature['Args']) {
    super(owner, args);

    let api = args.messagingAPI;

    api.onReceiveText((format: Format, text) => this.makeComponent(format, text));
    api.onConnect((parent) => (this.parentFrame = parent));
  }

  @action
  @waitFor
  async makeComponent(format: Format, text: string) {
    await compileTopLevelComponent(text, {
      format: format,
      onCompileStart: async () => {
        await this.parentFrame.beginCompile();
      },
      onSuccess: async (component) => {
        if (!component) {
          await this.parentFrame.error({ error: 'could not build component' });
          return;
        }

        if (isDestroyed(this) || isDestroying(this)) return;
        this.component = component as ComponentLike<never>;
        this.format = format;

        await this.parentFrame.success();

        schedule('afterRender', () => {
          if (isDestroyed(this) || isDestroying(this)) return;

          this.parentFrame.finishedRendering();
        });
      },
      onError: async (error: string) => {
        await this.parentFrame.error({ error });
      },
    });
  }
}
