import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faSpinner, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { getCompiler } from 'ember-repl';
import { getPromiseState } from 'reactiveweb/get-promise-state';
import { errorMessage } from 'repl-sdk';

import { canFormat, formatDocument } from 'limber/utils/formatting';

import { Button } from './button.gts';

import type EditorService from 'limber/services/editor';

export class FormatDocument extends Component {
  @service declare editor: EditorService;

  /**
   * The most recent formatting run.
   * getPromiseState derives the loading state from it.
   */
  @tracked request: Promise<void> | undefined;

  get canFormat() {
    return canFormat(this.editor.format);
  }

  get isFormatting() {
    return this.request ? getPromiseState(this.request).isLoading : false;
  }

  format = () => {
    if (this.isFormatting) return;

    const { format, text } = this.editor;

    if (!text) return;

    this.request = formatDocument(format, text).then((formatted) => {
      if (formatted !== text) {
        this.editor.update(formatted, format);
      }
    }, this.#report);
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
