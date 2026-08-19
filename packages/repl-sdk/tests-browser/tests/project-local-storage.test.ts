import { Project } from 'repl-sdk/project';
import {
  ACTIVE_KEY,
  LEGACY_ACTIVE_KEY,
  LEGACY_DOCUMENT_KEY,
  LEGACY_FORMAT_KEY,
  PROJECT_PREFIX,
  readStoredProject,
  storedFormat,
  writeStoredProject,
} from 'repl-sdk/project/local-storage';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

/**
 * Real localStorage, in a real browser, rather than a stand-in that can drift
 * from it. Tests within a file run in order and each one starts from empty.
 */
beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('writing', () => {
  test('stores the project under its format', () => {
    writeStoredProject(Project.single('a', { format: 'gjs' }));

    expect(localStorage.getItem(ACTIVE_KEY)).toBe('gjs');
    expect(localStorage.getItem(`${PROJECT_PREFIX}gjs`)).toBeTruthy();
  });

  test('keeps one document per format', () => {
    writeStoredProject(Project.single('a gjs doc', { format: 'gjs' }));
    writeStoredProject(Project.single('a gmd doc', { format: 'gmd' }));

    expect(readStoredProject({ format: 'gjs' })?.entry?.text).toBe('a gjs doc');
    expect(readStoredProject()?.entry?.text).toBe('a gmd doc');
  });

  test('ignores an empty project', () => {
    writeStoredProject(Project.empty);

    expect(localStorage.length).toBe(0);
  });
});

describe('reading', () => {
  test('round trips', () => {
    const project = Project.from({ files: { 'index.hbs': 'a' } }).withFormat('hbs|ember');

    writeStoredProject(project);

    expect(readStoredProject()?.equals(project)).toBe(true);
  });

  test('returns null when nothing is stored', () => {
    expect(readStoredProject()).toBe(null);
  });

  test('survives a corrupt entry', () => {
    localStorage.setItem(ACTIVE_KEY, 'gjs');
    localStorage.setItem(`${PROJECT_PREFIX}gjs`, '{not json');

    expect(readStoredProject()).toBe(null);
  });
});

describe('legacy keys', () => {
  test('recovers the format from the pre-VFS active key', () => {
    localStorage.setItem(LEGACY_ACTIVE_KEY, 'gjs-doc');

    expect(storedFormat()).toBe('gjs');
  });

  test('reads a document the old writer stored but never read back', () => {
    localStorage.setItem(LEGACY_ACTIVE_KEY, 'gjs-doc');
    localStorage.setItem('gjs-doc', 'recovered');

    const project = readStoredProject();

    expect(project?.entry?.text).toBe('recovered');
    expect(project?.format).toBe('gjs');
  });

  test('reads the oldest format/document pair', () => {
    localStorage.setItem(LEGACY_ACTIVE_KEY, 'gmd-doc');
    localStorage.setItem(LEGACY_FORMAT_KEY, 'gmd');
    localStorage.setItem(LEGACY_DOCUMENT_KEY, 'ancient');

    expect(readStoredProject()?.entry?.text).toBe('ancient');
  });

  test('prefers the new key over the legacy ones', () => {
    localStorage.setItem(LEGACY_ACTIVE_KEY, 'gjs-doc');
    localStorage.setItem('gjs-doc', 'old');
    writeStoredProject(Project.single('new', { format: 'gjs' }));

    expect(readStoredProject()?.entry?.text).toBe('new');
  });
});
