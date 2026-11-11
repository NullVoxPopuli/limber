import './share.css';
import './dependencies.css';

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { trackedArray } from '@ember/reactive/collections';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faBoxOpen, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Drawer } from 'ember-primitives/components/drawer';
import { getPromiseState } from 'reactiveweb/get-promise-state';

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
  name: string;
  version: string;
}

type Loaded = ReadonlyMap<string, string | undefined>;

/**
 * What the output loaded: from this page's compiler,
 * or from the frame that renders a pinned ember-source.
 */
class DependenciesBody extends Component<{ onClose: () => void }> {
  @service declare editor: EditorService;
  /**
   * Not `getCompiler`: the header is part of the prerendered pages,
   * and importing ember-repl here would put it in that build.
   */
  @service declare status: StatusService;

  @cached
  get request(): Promise<Loaded> {
    const frame = this.editor.outputFrame;

    if (!frame) return Promise.resolve(this.status.compiler.dependencies);

    return frame.dependencies().then((entries) => new Map(entries));
  }

  get state() {
    return getPromiseState(this.request);
  }

  <template>
    {{! The drawer focuses its first button, so it needs one while the list loads. }}
    <header><h2>package.json</h2>
      <FlatButton {{on "click" @onClose}} aria-label="close the dependencies drawer">
        <FaIcon @size="xs" @icon={{faXmark}} class="aspect-square" />
      </FlatButton>
    </header>
    {{#if this.state.resolved}}
      <DependenciesForm @loaded={{this.state.resolved}} @onClose={{@onClose}} />
    {{/if}}
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
            {{#each this.rows as |row index|}}
              <div class="entry-row">
                <span class="line"><span class="punct">"</span><input
                    name="name"
                    aria-label="Package name"
                    placeholder="dompurify"
                    value={{row.name}}
                    autocomplete="off"
                    spellcheck="false"
                    data-test-dependency-name
                  /><span class="punct">": "</span><input
                    name="version"
                    aria-label="Version"
                    placeholder={{if (this.isBundled row.name) "bundled" "latest"}}
                    value={{row.version}}
                    autocomplete="off"
                    spellcheck="false"
                    data-test-dependency-version
                  /><span class="punct">"{{if (this.isLast index) "" ","}}</span></span>
                <span class="comment">
                  {{~#if (this.loadedVersion row.name)}}// {{/if~}}
                  <span data-test-dependency-loaded>{{this.loadedVersion row.name}}</span>
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
   * Only the rows are state.
   * The inputs keep their own values until submit.
   *
   * Below the fields that `#initialRows` reads, because fields run in order.
   */
  rows = trackedArray<Row>(this.#initialRows());

  /**
   * Pins first, then the packages that loaded without a pin.
   *
   * Bundled modules of the app itself have no version, and get no row.
   */
  #initialRows(): Row[] {
    const pins = this.editor.versions;
    const rows: Row[] = Object.entries(pins).map(([name, version]) => ({ name, version }));

    for (const name of this.#loaded.keys()) {
      if (name in pins) continue;
      if (this.loadedVersion(name) === undefined) continue;

      rows.push({ name, version: '' });
    }

    return rows.length ? rows : [{ name: '', version: '' }];
  }

  isLast = (index: number) => index === this.rows.length - 1;

  add = () => {
    this.rows.push({ name: '', version: '' });
  };

  remove = (row: Row) => {
    this.rows.splice(this.rows.indexOf(row), 1);
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
