import LZString from 'lz-string';
import { describe, expect, it } from 'vitest';

import { Project } from '../project.js';
import { fits, parse, serialize, serializedLength } from './url.js';

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = LZString;

const SNIPPET = `<template>hello</template>`;

describe('parse', () => {
  it('reads the compressed param', () => {
    const project = parse(`format=gjs&c=${compressToEncodedURIComponent(SNIPPET)}`);

    expect(project?.format).toBe('gjs');
    expect(project?.entry?.text).toBe(SNIPPET);
    expect(project?.isSingleFile).toBe(true);
  });

  it('reads the legacy uncompressed param', () => {
    const params = new URLSearchParams();

    params.set('format', 'gmd');
    params.set('t', SNIPPET);

    expect(parse(params)?.entry?.text).toBe(SNIPPET);
  });

  it('prefers c over t', () => {
    const params = new URLSearchParams();

    params.set('c', compressToEncodedURIComponent('from c'));
    params.set('t', 'from t');

    expect(parse(params)?.entry?.text).toBe('from c');
  });

  it('passes an unknown format through instead of defaulting', () => {
    const params = new URLSearchParams({ format: 'glimdown', t: SNIPPET });

    expect(parse(params)?.format).toBe('glimdown');
  });

  it('keeps the flavor on a flavored format', () => {
    const params = new URLSearchParams({ format: 'hbs|ember', t: SNIPPET });
    const project = parse(params);

    expect(project?.format).toBe('hbs|ember');
    expect(project?.entryPath).toBe('index.hbs');
  });

  it('returns null when there is no document', () => {
    expect(parse('format=gjs')).toBe(null);
    expect(parse('')).toBe(null);
    expect(parse(undefined)).toBe(null);
  });

  it('reads a multi-file project', () => {
    const project = Project.from({
      files: { 'index.gjs': 'a', 'nested/other.gjs': 'b' },
    });

    expect(parse(serialize(project))?.equals(project)).toBe(true);
  });

  it('falls back to the single-file params when p is corrupt', () => {
    const params = new URLSearchParams({
      p: 'not-valid-lz',
      format: 'gjs',
      t: SNIPPET,
    });

    expect(parse(params)?.entry?.text).toBe(SNIPPET);
  });
});

describe('serialize', () => {
  it('writes the same shape the app writes today', () => {
    const params = serialize(Project.single(SNIPPET, { format: 'gjs' }));

    expect(params.get('format')).toBe('gjs');
    expect(decompressFromEncodedURIComponent(params.get('c') as string)).toBe(SNIPPET);
    expect(params.get('p')).toBe(null);
  });

  it('never writes the legacy t param', () => {
    const params = serialize(Project.single(SNIPPET, { format: 'gjs' }), {
      into: new URLSearchParams({ t: 'stale' }),
    });

    expect(params.get('t')).toBe(null);
  });

  it('preserves params it does not own', () => {
    const params = serialize(Project.single(SNIPPET, { format: 'gjs' }), {
      into: new URLSearchParams({
        shadowdom: 'false',
        editorLoad: 'force',
        c: 'stale',
        format: 'stale',
      }),
    });

    expect(params.get('shadowdom')).toBe('false');
    expect(params.get('editorLoad')).toBe('force');
    expect(params.get('format')).toBe('gjs');
  });

  it('uses p for more than one file, and drops the single-file params', () => {
    const project = Project.from({ files: { 'index.gjs': 'a', 'other.gjs': 'b' } });
    const params = serialize(project, { into: new URLSearchParams({ c: 'stale' }) });

    expect(params.get('p')).toBeTruthy();
    expect(params.get('c')).toBe(null);
    expect(params.get('format')).toBe(null);
  });

  it('round trips single-file projects', () => {
    const project = Project.single(SNIPPET, { format: 'hbs|ember' });

    expect(parse(serialize(project))?.equals(project)).toBe(true);
  });

  it('writes nothing for an empty project', () => {
    expect(serialize(Project.empty).toString()).toBe('');
  });
});

describe('budget', () => {
  it('measures the serialized length', () => {
    const small = Project.single('a', { format: 'gjs' });

    expect(serializedLength(small)).toBe(serialize(small).toString().length);
    expect(fits(small)).toBe(true);
  });

  it('reports when a project is too big for the URL', () => {
    /**
     * Distinct lines, because lz-string would flatten a repeated character
     * down to something that fits.
     */
    const text = Array.from({ length: 4000 }, (_, i) => `const value${i} = ${i * 7919};`).join(
      '\n'
    );
    const big = Project.single(text, { format: 'gjs' });

    expect(fits(big)).toBe(false);
    expect(fits(big, { budget: Infinity })).toBe(true);
  });
});
