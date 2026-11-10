import './share.css';

import Component from '@glimmer/component';
import { trackedArray } from '@ember/reactive/collections';
import { service } from '@ember/service';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faBoxOpen, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { focusTrap } from 'ember-focus-trap';
import { Modal } from 'ember-primitives/components/dialog';

import { bundledVersion, serializeDeps, type Versions } from 'limber/utils/dependencies';

import { FlatButton } from '@nullvoxpopuli/limber-shared';

import type RouterService from '@ember/routing/router-service';
import type EditorService from 'limber/services/editor';
import type StatusService from 'limber/services/status';

export const Dependencies = <template>
  <Modal as |m|>
    <button
      data-dependencies-button
      type="button"
      aria-label="Dependencies"
      {{on "click" m.open}}
      {{m.focusOnClose}}
    >
      <span class="sm:inline-flex hidden">Dependencies</span>
      <FaIcon @icon={{faBoxOpen}} />
    </button>

    <m.Dialog class="preem" inert={{not m.isOpen}} {{focusTrap isActive=m.isOpen}}>
      {{#if m.isOpen}}
        <div class="modal-facade">
          <DependenciesForm @onClose={{m.close}} />
        </div>
      {{/if}}
    </m.Dialog>
  </Modal>
</template>;

interface Row {
  name: string;
  version: string;
}

class DependenciesForm extends Component<{ onClose: () => void }> {
  <template>
    <header><h2>Dependencies</h2>
      <FlatButton {{on "click" @onClose}} aria-label="close the dependencies modal">
        <FaIcon @size="xs" @icon={{faXmark}} class="aspect-square" />
      </FlatButton>
    </header>
    <form {{on "submit" this.handleSubmit}}>
      <main>
        <p>
          Pin the npm version of a package that the document imports. Loaded is the version that
          runs now. A pin also replaces a bundled package, except ember-source.
        </p>

        <div class="dependency-rows">
          <span>Package</span>
          <span>Version</span>
          <span>Loaded</span>
          <span></span>
          {{#each this.rows as |row|}}
            <input
              name="name"
              aria-label="Package name"
              placeholder="dompurify"
              value={{row.name}}
              autocomplete="off"
              data-test-dependency-name
            />
            <input
              name="version"
              aria-label="Version"
              placeholder={{if (this.isBundled row.name) "bundled" "latest"}}
              value={{row.version}}
              autocomplete="off"
              data-test-dependency-version
            />
            <span class="loaded" data-test-dependency-loaded>{{this.loadedVersion row.name}}</span>
            <button
              type="button"
              aria-label="Remove"
              data-test-remove-dependency
              {{on "click" (fn this.remove row)}}
            >
              <FaIcon @icon={{faTrash}} />
            </button>
          {{/each}}
          {{#each this.fixed as |pkg|}}
            <span class="bundled-name" data-test-bundled-name>{{pkg.name}}</span>
            <span class="bundled-label">bundled</span>
            <span class="loaded" data-test-bundled-version>{{pkg.version}}</span>
            <span></span>
          {{/each}}
        </div>

        <div>
          <button type="button" data-test-add-dependency {{on "click" this.add}}>Add package</button>
        </div>
      </main>

      <footer>
        <div class="right">
          <div class="buttons">
            <button type="button" class="cancel" {{on "click" @onClose}}>Cancel</button>
            <button type="submit" data-test-apply-dependencies>Apply</button>
          </div>
        </div>
      </footer>
    </form>
  </template>

  @service declare editor: EditorService;
  @service declare router: RouterService;
  /**
   * Not `getCompiler`: the header is part of the prerendered pages,
   * and importing ember-repl here would put it in that build.
   */
  @service declare status: StatusService;

  get #loaded() {
    return this.status.compiler.dependencies;
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
   * Bundled packages that a pin cannot replace, such as ember-source.
   */
  get fixed() {
    const rows: { name: string; version: string }[] = [];

    for (const name of this.#loaded.keys()) {
      const version = bundledVersion(name);

      if (version && this.isBundled(name) && !this.status.compiler.canOverride(name)) {
        rows.push({ name, version });
      }
    }

    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }

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
      if (this.isBundled(name) && !this.status.compiler.canOverride(name)) continue;
      if (this.loadedVersion(name) === undefined) continue;

      rows.push({ name, version: '' });
    }

    return rows.length ? rows : [{ name: '', version: '' }];
  }

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
