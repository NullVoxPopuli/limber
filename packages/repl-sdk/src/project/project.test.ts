import { describe, expect, it } from 'vitest';

import { File } from './file.js';
import { basename, dirname, extname, normalize } from './path.js';
import { extFor, Project } from './project.js';

import type { ProjectJSON } from './index.d.ts';

describe('path', () => {
  it.each([
    ['./foo.gjs', 'foo.gjs'],
    ['/foo.gjs', 'foo.gjs'],
    ['././foo.gjs', 'foo.gjs'],
    ['a//b//c.gjs', 'a/b/c.gjs'],
    ['a\\b.gjs', 'a/b.gjs'],
    ['  foo.gjs  ', 'foo.gjs'],
  ])('normalize(%s) is %s', (input, expected) => {
    expect(normalize(input)).toBe(expected);
  });

  it('splits names', () => {
    expect(basename('a/b/c.gjs')).toBe('c.gjs');
    expect(dirname('a/b/c.gjs')).toBe('a/b');
    expect(dirname('c.gjs')).toBe('');
  });

  it.each([
    ['index.gjs', 'gjs'],
    ['index.test.gts', 'gts'],
    ['README', ''],
    ['.gitignore', ''],
  ])('extname(%s) is %s', (input, expected) => {
    expect(extname(input)).toBe(expected);
  });

  it('drops the flavor when deriving an extension', () => {
    expect(extFor('hbs|ember')).toBe('hbs');
    expect(extFor('jsx|react')).toBe('jsx');
    expect(extFor('gmd')).toBe('gmd');
  });
});

describe('File', () => {
  it('prefers an explicit format over the extension', () => {
    const file = new File('index.hbs', 'hi', { format: 'hbs|ember' });

    expect(file.format).toBe('hbs|ember');
    expect(file.ext).toBe('hbs');
    expect(file.hasExplicitFormat).toBe(true);
  });

  it('falls back to the extension', () => {
    const file = new File('index.gjs', 'hi');

    expect(file.format).toBe('gjs');
    expect(file.hasExplicitFormat).toBe(false);
  });

  it('returns itself when nothing changes', () => {
    const file = new File('index.gjs', 'hi');

    expect(file.withText('hi')).toBe(file);
    expect(file.withPath('./index.gjs')).toBe(file);
  });
});

describe('Project', () => {
  it('builds from a plain object', () => {
    const project = Project.from({ files: { 'index.gjs': 'a', 'other.gjs': 'b' } });

    expect(project.paths).toEqual(['index.gjs', 'other.gjs']);
    expect(project.entryPath).toBe('index.gjs');
    expect(project.read('other.gjs')).toBe('b');
  });

  it('names the single-file entry after the format', () => {
    expect(Project.single('x', { format: 'gjs' }).entryPath).toBe('index.gjs');
    expect(Project.single('x', { format: 'hbs|ember' }).entryPath).toBe('index.hbs');
    expect(Project.single('x', { format: 'hbs|ember' }).format).toBe('hbs|ember');
  });

  it('does not mutate on write', () => {
    const before = Project.single('a', { format: 'gjs' });
    const after = before.write('index.gjs', 'b');

    expect(before.read('index.gjs')).toBe('a');
    expect(after.read('index.gjs')).toBe('b');
    expect(after).not.toBe(before);
  });

  it('returns the same instance when a write changes nothing', () => {
    const project = Project.single('a', { format: 'gjs' });

    expect(project.write('index.gjs', 'a')).toBe(project);
  });

  it('adopts the first written file as the entry', () => {
    const project = Project.empty.write('main.gjs', 'a').write('other.gjs', 'b');

    expect(project.entryPath).toBe('main.gjs');
  });

  it('renames the entry along with the file', () => {
    const project = Project.single('a', { format: 'gjs' }).rename('index.gjs', 'app.gjs');

    expect(project.entryPath).toBe('app.gjs');
    expect(project.read('app.gjs')).toBe('a');
    expect(project.has('index.gjs')).toBe(false);
  });

  it('picks a new entry when the entry is removed', () => {
    const project = Project.from({ files: { 'a.gjs': '1', 'b.gjs': '2' } }).remove('a.gjs');

    expect(project.entryPath).toBe('b.gjs');
  });

  it('renames the synthesized entry when the format changes', () => {
    const project = Project.single('a', { format: 'gjs' }).withFormat('gmd');

    expect(project.entryPath).toBe('index.gmd');
    expect(project.format).toBe('gmd');
  });

  it('names a formatless entry without a trailing dot', () => {
    const project = Project.single('a');

    expect(project.entryPath).toBe('index');
    expect(project.withFormat('gmd').entryPath).toBe('index.gmd');
  });

  it('leaves a real filename alone when the format changes', () => {
    const project = Project.from({ files: { 'app.gjs': 'a' } }).withFormat('gmd');

    expect(project.entryPath).toBe('app.gjs');
    expect(project.format).toBe('gmd');
  });

  it('compares by value', () => {
    const a = Project.single('x', { format: 'gjs' });
    const b = Project.single('x', { format: 'gjs' });
    const c = Project.single('y', { format: 'gjs' });

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(a.equals(a.withFormat('gmd'))).toBe(false);
  });

  it('round trips through JSON', () => {
    const project = Project.from({
      files: [
        { path: 'index.hbs', text: 'a', format: 'hbs|ember' },
        { path: 'nested/other.gjs', text: 'b' },
      ],
      entry: 'nested/other.gjs',
    });

    const copy = Project.fromJSON(JSON.parse(JSON.stringify(project)) as ProjectJSON);

    expect(copy.equals(project)).toBe(true);
    expect(copy.entryPath).toBe('nested/other.gjs');
  });

  it('omits the format from JSON when it is only the extension', () => {
    const json = Project.from({ files: { 'index.gjs': 'a' } }).toJSON();

    expect(json.files[0]).toEqual({ path: 'index.gjs', text: 'a' });
  });
});
