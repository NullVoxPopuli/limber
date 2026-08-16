import { beforeEach, describe, expect, it } from 'vitest';

import { Project } from '../project.js';
import {
  ACTIVE_KEY,
  activeFormat,
  LEGACY_ACTIVE_KEY,
  LEGACY_DOCUMENT_KEY,
  LEGACY_FORMAT_KEY,
  parse,
  PROJECT_PREFIX,
  serialize,
} from './local-storage.js';

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
    serialize(Project.single('a', { format: 'gjs' }), { storage });

    expect(storage.getItem(ACTIVE_KEY)).toBe('gjs');
    expect(storage.getItem(`${PROJECT_PREFIX}gjs`)).toBeTruthy();
  });

  it('keeps one document per format', () => {
    serialize(Project.single('a gjs doc', { format: 'gjs' }), { storage });
    serialize(Project.single('a gmd doc', { format: 'gmd' }), { storage });

    expect(parse({ storage, format: 'gjs' })?.entry?.text).toBe('a gjs doc');
    expect(parse({ storage })?.entry?.text).toBe('a gmd doc');
  });

  it('ignores an empty project', () => {
    serialize(Project.empty, { storage });

    expect(storage.length).toBe(0);
  });
});

describe('parse', () => {
  it('round trips', () => {
    const project = Project.from({ files: { 'index.hbs': 'a' }, entry: 'index.hbs' }).withFormat(
      'hbs|ember'
    );

    serialize(project, { storage });

    expect(parse({ storage })?.equals(project)).toBe(true);
  });

  it('returns null when nothing is stored', () => {
    expect(parse({ storage })).toBe(null);
  });

  it('survives a corrupt entry', () => {
    storage.setItem(ACTIVE_KEY, 'gjs');
    storage.setItem(`${PROJECT_PREFIX}gjs`, '{not json');

    expect(parse({ storage })).toBe(null);
  });
});

describe('legacy keys', () => {
  it('recovers the format from the pre-VFS active key', () => {
    storage.setItem(LEGACY_ACTIVE_KEY, 'gjs-doc');

    expect(activeFormat({ storage })).toBe('gjs');
  });

  it('reads a document the old writer stored but never read back', () => {
    storage.setItem(LEGACY_ACTIVE_KEY, 'gjs-doc');
    storage.setItem('gjs-doc', 'recovered');

    const project = parse({ storage });

    expect(project?.entry?.text).toBe('recovered');
    expect(project?.format).toBe('gjs');
  });

  it('reads the oldest format/document pair', () => {
    storage.setItem(LEGACY_ACTIVE_KEY, 'gmd-doc');
    storage.setItem(LEGACY_FORMAT_KEY, 'gmd');
    storage.setItem(LEGACY_DOCUMENT_KEY, 'ancient');

    expect(parse({ storage })?.entry?.text).toBe('ancient');
  });

  it('prefers the new key over the legacy ones', () => {
    storage.setItem(LEGACY_ACTIVE_KEY, 'gjs-doc');
    storage.setItem('gjs-doc', 'old');
    serialize(Project.single('new', { format: 'gjs' }), { storage });

    expect(parse({ storage })?.entry?.text).toBe('new');
  });
});
