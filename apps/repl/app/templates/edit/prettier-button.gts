import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { fn, concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';

import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

import type EditorService from '#app/services/editor';

export class PrettierButton extends Component {
  @service declare editor: EditorService;

  @tracked isFormatting = false;
  @tracked hasError = false;
  @tracked errorMessage = '';

  formatCode = async () => {
    if (!this.editor.formatCode || this.isFormatting) return;

    this.isFormatting = true;
    this.hasError = false;
    this.errorMessage = '';

    try {
      await this.editor.formatCode();
    } catch (error) {
      this.hasError = true;
      this.errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Prettier formatting failed:', error);
    } finally {
      this.isFormatting = false;
    }
  };

  <template>
    <button
      class="
        ring-ember-brand relative px-2 py-1 text-left drop-shadow-md transition
        duration-150 ease-in-out hover:drop-shadow-xl focus:rounded focus:outline-none
        focus:ring-4 focus-visible:rounded focus-visible:outline-none sm:text-sm
        text-white select-none bg-ember-black
        {{if this.hasError 'bg-red-700'}}
        {{if this.isFormatting 'opacity-50 cursor-wait'}}
      "
      {{on "click" (fn this.formatCode)}}
      type="button"
      disabled={{this.isFormatting}}
      title={{if this.hasError
        (concat "Format failed: " this.errorMessage)
        "Format code with Prettier"
      }}
    >
      <FaIcon
        @icon={{faWandMagicSparkles}}
        class={{if this.isFormatting "animate-spin"}}
      />
      <span class="ml-2 hidden sm:inline">Format</span>
    </button>
  </template>
}
