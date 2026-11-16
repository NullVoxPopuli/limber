import './share.css';
import './dependencies.css';

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { trackedArray, trackedSet } from '@ember/reactive/collections';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faBoxOpen, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Drawer } from 'ember-primitives/components/drawer';

import { bundledVersion, serializeDeps, type Versions } from 'limber/utils/dependencies';

import { ExternalLink, FlatButton } from '@nullvoxpopuli/limber-shared';

import type RouterService from '@ember/routing/router-service';
import type EditorService from 'limber/services/editor';
import type StatusService from 'limber/services/status';

export const Dependencies = <template>
  <Drawer as |d|>
    <button
      data-dependencies-button
      type="button"
      aria-label="Dependencies"
      {{on "click" d.open}}
      {{d.focusOnClose}}
    >
      <span class="sm:inline-flex hidden">Dependencies</span>
      <FaIcon @icon={{faBoxOpen}} />
    </button>

    <d.Drawer class="dependencies-drawer" aria-label="Dependencies">
      {{#if d.isOpen}}
        <DependenciesBody @onClose={{d.close}} />
      {{/if}}
    </d.Drawer>
  </Drawer>
</template>;

interface Row {
  /**
   * Keeps the inputs of a row across changes to the list.
   */
  key: string;
  name: string;
  version: string;
}

type Loaded = ReadonlyMap<string, string | undefined>;

class DependenciesBody extends Component<{ onClose: () => void }> {
  @service declare editor: EditorService;
  /**
   * Not `getCompiler`: the header is part of the prerendered pages,
   * and importing ember-repl here would put it in that build.
   */
  @service declare status: StatusService;

  /**
   * What the output loaded: from this page's compiler,
   * or from the frame that renders a pinned ember-source.
   *
   * Until a new frame finishes its first compile, the last list stays.
   */
  get loaded(): Loaded {
    const frame = this.editor.rendersInFrame ? this.editor.frameDependencies : undefined;

    return frame ?? this.status.compiler.dependencies;
  }

  <template>
    <header><h2>package.json</h2>
      <FlatButton {{on "click" @onClose}} aria-label="close the dependencies drawer">
        <FaIcon @size="xs" @icon={{faXmark}} class="aspect-square" />
      </FlatButton>
    </header>
    <DependenciesForm @loaded={{this.loaded}} @onClose={{@onClose}} />
  </template>
}

class DependenciesForm extends Component<{ loaded: Loaded; onClose: () => void }> {
  <template>
    <form {{on "submit" this.handleSubmit}}>
      <main>
        <p>
          Pin the npm version of a package that the document imports. The comment shows the version
          that runs now. See
          <ExternalLink href="/docs/editor#imports">version specifiers</ExternalLink>.
        </p>

        <div class="package-json">
          <div class="line">{</div>
          <div class="line nested read-only">"name": "repl-document",</div>
          <div class="line nested">"dependencies": {</div>
          <div class="entries">
            {{#each this.rows key="key" as |row index|}}
              <div class="entry-row" {{on "input" (fn this.keep row)}}>
                <span class="line"><span class="key"><span class="punct">"</span><input
                      name="name"
                      aria-label="Package name"
                      placeholder="dompurify"
                      value={{row.name}}
                      autocomplete="off"
                      spellcheck="false"
                      data-test-dependency-name
                    /><span class="punct">"</span></span><span class="punct">:</span><span
                    class="value"
                  ><span class="punct">"</span><input
                      name="version"
                      aria-label="Version"
                      placeholder={{if (this.isBundled row.name) "bundled" "latest"}}
                      value={{row.version}}
                      autocomplete="off"
                      spellcheck="false"
                      data-test-dependency-version
                    /><span class="punct">"{{if (this.isLast index) "" ","}}</span></span></span>
                <span class="comment">
                  {{#if (this.loadedVersion row.name)}}
                    <span class="slashes">//</span>
                  {{/if}}
                  {{#if (this.loadedVersion row.name)}}
                    <span class="pointer">↑</span>
                  {{/if}}
                  <span class="note" data-test-dependency-loaded>{{this.loadedVersion
                      row.name
                    }}</span>
                </span>
                <button
                  type="button"
                  class="remove"
                  aria-label="Remove"
                  data-test-remove-dependency
                  {{on "click" (fn this.remove row)}}
                >
                  <FaIcon @icon={{faTrash}} />
                </button>
              </div>
            {{/each}}
            <div class="line add-line">
              <button type="button" class="add" data-test-add-dependency {{on "click" this.add}}>
                + Add package
              </button>
            </div>
          </div>
          <div class="line nested">}</div>
          <div class="line">}</div>
        </div>
      </main>

      <footer>
        <button type="button" class="cancel" {{on "click" @onClose}}>Cancel</button>
        <button type="submit" data-test-apply-dependencies>Apply</button>
      </footer>
    </form>
  </template>

  @service declare editor: EditorService;
  @service declare router: RouterService;

  get #loaded() {
    return this.args.loaded;
  }

  /**
   * ember-repl reports a bundled package with no version.
   */
  isBundled = (name: string) => this.#loaded.has(name) && this.#loaded.get(name) === undefined;

  loadedVersion = (name: string) =>
    this.isBundled(name) ? bundledVersion(name) : this.#loaded.get(name);

  /**
   * The rows that the user added or removed are the only state.
   * The inputs keep their own values until submit.
   */
  #added = trackedArray<Row>();
  #removed = trackedSet<string>();

  /**
   * Shows while there is nothing else, so that a package can be typed in.
   */
  #blank: Row = { key: 'blank', name: '', version: '' };

  /**
   * What loaded, then the pins that did not load, then the added rows.
   *
   * Bundled modules of the app itself have no version, and get no row.
   */
  @cached
  get rows(): Row[] {
    const pins = this.editor.versions;
    const rows: Row[] = [];

    for (const name of this.#loaded.keys()) {
      if (!(name in pins) && this.loadedVersion(name) === undefined) continue;

      rows.push({ key: name, name, version: pins[name] ?? '' });
    }

    for (const [name, version] of Object.entries(pins)) {
      if (this.#loaded.has(name)) continue;

      rows.push({ key: name, name, version });
    }

    const kept = rows.filter((row) => !this.#removed.has(row.key));

    for (const row of this.#added) {
      kept.push(row);
    }

    return kept.length ? kept : [this.#blank];
  }

  isLast = (index: number) => index === this.rows.length - 1;

  /**
   * The blank row stays once it has text, even after packages load.
   */
  keep = (row: Row) => {
    if (row === this.#blank && !this.#added.includes(row)) this.#added.push(row);
  };

  add = () => {
    this.keep(this.rows[0] as Row);
    this.#added.push({ key: crypto.randomUUID(), name: '', version: '' });
  };

  remove = (row: Row) => {
    const index = this.#added.indexOf(row);

    if (index === -1) {
      this.#removed.add(row.key);
    } else {
      this.#added.splice(index, 1);
    }
  };

  handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const names = data.getAll('name');
    const versions = data.getAll('version');
    const pins: Versions = {};

    for (let i = 0; i < names.length; i++) {
      const name = text(names[i]);
      const version = text(versions[i]);

      /**
       * No version means latest, which needs no pin.
       */
      if (name && version) {
        pins[name] = version;
      }
    }

    const url = new URL(this.router.currentURL ?? '/edit', location.origin);
    const deps = serializeDeps(pins);

    if (deps) {
      url.searchParams.set('deps', deps);
    } else {
      url.searchParams.delete('deps');
    }

    this.router.replaceWith(url.pathname + url.search);
    this.args.onClose();
  };
}

function text(value: FormDataEntryValue | undefined) {
  return typeof value === 'string' ? value.trim() : '';
}
