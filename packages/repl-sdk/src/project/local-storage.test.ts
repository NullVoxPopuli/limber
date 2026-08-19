import { beforeEach, describe, expect, it } from 'vitest';

import {
  ACTIVE_KEY,
  LEGACY_ACTIVE_KEY,
  LEGACY_DOCUMENT_KEY,
  LEGACY_FORMAT_KEY,
  PROJECT_PREFIX,
  readStoredProject,
  storedFormat,
  writeStoredProject,
} from './local-storage.js';
import { Project } from './project.js';

class MemoryStorage implements Storage {
  #map = new Map<string, string>();

  get length() {
    return this.#map.size;
  }

  clear() {
    this.#map.clear();
  }

  getItem(key: string) {
    return this.#map.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.#map.set(key, String(value));
  }

  removeItem(key: string) {
    this.#map.delete(key);
  }

  key(index: number) {
    return [...this.#map.keys()][index] ?? null;
  }
}

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
});

describe('serialize', () => {
  it('stores the project under its format', () => {
    writeStoredProject(Project.single('a', { format: 'gjs' }), { storage });

    expect(storage.getItem(ACTIVE_KEY)).toBe('gjs');
    expect(storage.getItem(`${PROJECT_PREFIX}gjs`)).toBeTruthy();
  });

  it('keeps one document per format', () => {
    writeStoredProject(Project.single('a gjs doc', { format: 'gjs' }), { storage });
    writeStoredProject(Project.single('a gmd doc', { format: 'gmd' }), { storage });

    expect(readStoredProject({ storage, format: 'gjs' })?.entry?.text).toBe('a gjs doc');
    expect(readStoredProject({ storage })?.entry?.text).toBe('a gmd doc');
  });

  it('ignores an empty project', () => {
    writeStoredProject(Project.empty, { storage });

    expect(storage.length).toBe(0);
  });
});

describe('parse', () => {
  it('round trips', () => {
    const project = Project.from({ files: { 'index.hbs': 'a' }, entry: 'index.hbs' }).withFormat(
      'hbs|ember'
    );

    writeStoredProject(project, { storage });

    expect(readStoredProject({ storage })?.equals(project)).toBe(true);
  });

  it('returns null when nothing is stored', () => {
    expect(readStoredProject({ storage })).toBe(null);
  });

  it('survives a corrupt entry', () => {
    storage.setItem(ACTIVE_KEY, 'gjs');
    storage.setItem(`${PROJECT_PREFIX}gjs`, '{not json');

    expect(readStoredProject({ storage })).toBe(null);
  });
});

describe('legacy keys', () => {
  it('recovers the format from the pre-VFS active key', () => {
    storage.setItem(LEGACY_ACTIVE_KEY, 'gjs-doc');

    expect(storedFormat({ storage })).toBe('gjs');
  });

  it('reads a document the old writer stored but never read back', () => {
    storage.setItem(LEGACY_ACTIVE_KEY, 'gjs-doc');
    storage.setItem('gjs-doc', 'recovered');

    const project = readStoredProject({ storage });

    expect(project?.entry?.text).toBe('recovered');
    expect(project?.format).toBe('gjs');
  });

  it('reads the oldest format/document pair', () => {
    storage.setItem(LEGACY_ACTIVE_KEY, 'gmd-doc');
    storage.setItem(LEGACY_FORMAT_KEY, 'gmd');
    storage.setItem(LEGACY_DOCUMENT_KEY, 'ancient');

    expect(readStoredProject({ storage })?.entry?.text).toBe('ancient');
  });

  it('prefers the new key over the legacy ones', () => {
    storage.setItem(LEGACY_ACTIVE_KEY, 'gjs-doc');
    storage.setItem('gjs-doc', 'old');
    writeStoredProject(Project.single('new', { format: 'gjs' }), { storage });

    expect(readStoredProject({ storage })?.entry?.text).toBe('new');
  });
});
