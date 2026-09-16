import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faSpinner, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { getCompiler } from 'ember-repl';
import { errorMessage } from 'repl-sdk';

import { canFormat, formatDocument } from 'limber/utils/formatting';

import { Button } from './button.gts';

import type EditorService from 'limber/services/editor';

export class FormatDocument extends Component {
  @service declare editor: EditorService;

  @tracked isFormatting = false;

  get canFormat() {
    return canFormat(this.editor.format);
  }

  format = () => waitForPromise(this.#format());

  #format = async () => {
    if (this.isFormatting) return;

    const { format, text } = this.editor;

    if (!text) return;

    this.isFormatting = true;

    try {
      const formatted = await formatDocument(format, text);

      if (formatted !== text) {
        this.editor.update(formatted, format);
      }
    } catch (error) {
      this.#report(error);
    } finally {
      this.isFormatting = false;
    }
  };

  /**
   * The status footer shows the compiler's last error,
   * and a compile clears the messages,
   * so a formatting error stays visible until the next edit.
   */
  #report = (error: unknown) => {
    const compiler = getCompiler(this);
    const message = errorMessage(error);

    console.error(message);

    compiler.messages.push({ type: 'error', message });
    // Waiting on better array primitive
    // eslint-disable-next-line no-self-assign
    compiler.messages = compiler.messages;
  };

  <template>
    {{#if this.canFormat}}
      <Button
        title="Format document"
        disabled={{this.isFormatting}}
        data-test-format-document
        {{on "click" this.format}}
      >
        {{#if this.isFormatting}}
          <FaIcon @icon={{faSpinner}} @spin={{true}} />
        {{else}}
          <FaIcon @icon={{faWandMagicSparkles}} />
        {{/if}}
      </Button>
    {{/if}}
  </template>
}
