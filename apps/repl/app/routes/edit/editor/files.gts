import './files.css';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';

import { modifier } from 'ember-modifier';

import { default as RemoveIcon } from '~icons/mdi/close?raw';
import { default as AddIcon } from '~icons/mdi/file-plus-outline?raw';
import { default as RenameIcon } from '~icons/mdi/pencil-outline?raw';
import { default as ImportIcon } from '~icons/mdi/tray-arrow-up?raw';

import type EditorService from '#app/services/editor.ts';

/**
 * The icons are SVG files from this app's build, not user text.
 */
const icon = (svg: string) => htmlSafe(svg);

const focusAndSelectName = modifier((input: HTMLInputElement) => {
  input.focus();

  const dot = input.value.lastIndexOf('.');

  input.setSelectionRange(0, dot > 0 ? dot : input.value.length);
});

/**
 * Reads files from disk into the project.
 * A file whose name is taken is an error, not a replacement.
 */
async function importFiles(editor: EditorService, files: FileList | null | undefined) {
  const problems: string[] = [];

  for (const file of Array.from(files ?? [])) {
    const problem = editor.addFile(file.name, await file.text());

    if (problem) problems.push(problem);
  }

  return problems.join(' ');
}

interface NameFormSignature {
  Args: {
    label: string;
    initial: string;
    save: (name: string) => string | undefined;
    cancel: () => void;
  };
}

class NameForm extends Component<NameFormSignature> {
  @tracked problem: string | undefined;

  handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const name = new FormData(form).get('name');

    this.problem = this.args.save(typeof name === 'string' ? name : '');
  };

  handleKey = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;

    event.stopPropagation();
    this.args.cancel();
  };

  <template>
    <form class="limber__files__form" {{on "submit" this.handleSubmit}}>
      <input
        name="name"
        aria-label={{@label}}
        aria-invalid={{if this.problem "true"}}
        aria-describedby={{if this.problem "limber-files-problem"}}
        value={{@initial}}
        autocomplete="off"
        spellcheck="false"
        {{focusAndSelectName}}
        {{on "keydown" this.handleKey}}
        {{on "blur" @cancel}}
      />
      {{#if this.problem}}
        <p
          id="limber-files-problem"
          class="limber__files__problem"
          role="alert"
        >{{this.problem}}</p>
      {{/if}}
    </form>
  </template>
}

/**
 * The files of the project. The entry is always first, and cannot be removed:
 * its name comes from the format, so the compiler knows how to start.
 *
 * The button that shows and hides this list is with the other editor controls.
 */
export class Files extends Component {
  @service declare editor: EditorService;

  @tracked isAdding = false;
  @tracked renaming: string | undefined;
  @tracked importProblem: string | undefined;
  @tracked isDropTarget = false;

  get paths() {
    return Object.keys(this.editor.files).sort();
  }

  isActive = (path: string | undefined) => this.editor.activePath === path;

  startAdding = () => {
    this.renaming = undefined;
    this.isAdding = true;
  };

  stopAdding = () => {
    this.isAdding = false;
  };

  add = (name: string) => {
    const problem = this.editor.addFile(name);

    if (!problem) this.isAdding = false;

    return problem;
  };

  startRenaming = (path: string) => {
    this.isAdding = false;
    this.renaming = path;
  };

  stopRenaming = () => {
    this.renaming = undefined;
  };

  rename = (from: string, to: string) => {
    const problem = this.editor.renameFile(from, to);

    if (!problem) this.renaming = undefined;

    return problem;
  };

  renameFrom = (from: string) => (to: string) => this.rename(from, to);

  remove = (path: string) => {
    this.editor.removeFile(path);
  };

  open = (path: string | undefined) => {
    this.editor.openFile(path);
  };

  handleImport = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;

    this.importProblem = (await importFiles(this.editor, input.files)) || undefined;
    input.value = '';
  };

  handleDragOver = (event: DragEvent) => {
    if (!event.dataTransfer?.types.includes('Files')) return;

    event.preventDefault();
    this.isDropTarget = true;
  };

  handleDragLeave = () => {
    this.isDropTarget = false;
  };

  handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    this.isDropTarget = false;
    this.importProblem = (await importFiles(this.editor, event.dataTransfer?.files)) || undefined;
  };

  <template>
    <nav
      class="limber__files {{if this.isDropTarget 'limber__files--drop'}}"
      aria-label="Files"
      data-test-files
      {{on "dragover" this.handleDragOver}}
      {{on "dragleave" this.handleDragLeave}}
      {{on "drop" this.handleDrop}}
    >
      <header class="limber__files__header">
        <span>Files</span>
        <span class="limber__files__actions">
          <button
            type="button"
            class="limber__files__icon-button"
            title="New file"
            aria-label="New file"
            data-test-files-add
            {{on "click" this.startAdding}}
          >{{icon AddIcon}}</button>
          <label class="limber__files__icon-button" title="Import files from disk">
            {{icon ImportIcon}}
            <span class="sr-only">Import files from disk</span>
            <input
              type="file"
              multiple
              class="sr-only"
              data-test-files-import
              {{on "change" this.handleImport}}
            />
          </label>
        </span>
      </header>

      <ul class="limber__files__list">
        <li class="limber__files__item">
          <button
            type="button"
            class="limber__files__name"
            aria-current={{if (this.isActive undefined) "true"}}
            data-test-file={{this.editor.entryName}}
            {{on "click" (fn this.open undefined)}}
          >
            {{this.editor.entryName}}
            <span class="limber__files__badge">entry</span>
          </button>
        </li>

        {{#each this.paths as |path|}}
          <li class="limber__files__item">
            {{#if (eq this.renaming path)}}
              <NameForm
                @label="New name for {{path}}"
                @initial={{path}}
                @save={{this.renameFrom path}}
                @cancel={{this.stopRenaming}}
              />
            {{else}}
              <button
                type="button"
                class="limber__files__name"
                aria-current={{if (this.isActive path) "true"}}
                data-test-file={{path}}
                {{on "click" (fn this.open path)}}
                {{on "dblclick" (fn this.startRenaming path)}}
              >{{path}}</button>
              <button
                type="button"
                class="limber__files__icon-button limber__files__item-action"
                title="Rename {{path}}"
                aria-label="Rename {{path}}"
                {{on "click" (fn this.startRenaming path)}}
              >{{icon RenameIcon}}</button>
              <button
                type="button"
                class="limber__files__icon-button limber__files__item-action"
                title="Delete {{path}}"
                aria-label="Delete {{path}}"
                data-test-file-remove={{path}}
                {{on "click" (fn this.remove path)}}
              >{{icon RemoveIcon}}</button>
            {{/if}}
          </li>
        {{/each}}

        {{#if this.isAdding}}
          <li class="limber__files__item">
            <NameForm
              @label="New file name"
              @initial="component.gjs"
              @save={{this.add}}
              @cancel={{this.stopAdding}}
            />
          </li>
        {{/if}}
      </ul>

      {{#if this.importProblem}}
        <p class="limber__files__problem" role="alert">{{this.importProblem}}</p>
      {{/if}}

      <p class="limber__files__hint">Import with
        <code>./name.ext</code>. Drop files here to add them.</p>
    </nav>
  </template>
}

function eq(a: unknown, b: unknown) {
  return a === b;
}
