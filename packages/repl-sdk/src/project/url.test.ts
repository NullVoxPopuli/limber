import LZString from 'lz-string';
import { describe, expect, it } from 'vitest';

import { Project } from './project.js';
import { readProject, writeProject } from './url.js';

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = LZString;

const SNIPPET = `<template>hello</template>`;

describe('parse', () => {
  it('reads the compressed param', () => {
    const project = readProject(`format=gjs&c=${compressToEncodedURIComponent(SNIPPET)}`);

    expect(project?.format).toBe('gjs');
    expect(project?.entry?.text).toBe(SNIPPET);
    expect(project?.isSingleFile).toBe(true);
  });

  it('reads the legacy uncompressed param', () => {
    const params = new URLSearchParams();

    params.set('format', 'gmd');
    params.set('t', SNIPPET);

    expect(readProject(params)?.entry?.text).toBe(SNIPPET);
  });

  it('prefers c over t', () => {
    const params = new URLSearchParams();

    params.set('c', compressToEncodedURIComponent('from c'));
    params.set('t', 'from t');

    expect(readProject(params)?.entry?.text).toBe('from c');
  });

  it('passes an unknown format through instead of defaulting', () => {
    const params = new URLSearchParams({ format: 'glimdown', t: SNIPPET });

    expect(readProject(params)?.format).toBe('glimdown');
  });

  it('keeps the flavor on a flavored format', () => {
    const params = new URLSearchParams({ format: 'hbs|ember', t: SNIPPET });
    const project = readProject(params);

    expect(project?.format).toBe('hbs|ember');
    expect(project?.entryPath).toBe('index.hbs');
  });

  it('returns null when there is no document', () => {
    expect(readProject('format=gjs')).toBe(null);
    expect(readProject('')).toBe(null);
    expect(readProject(undefined)).toBe(null);
  });

  it('reads a project out of the same param', () => {
    const project = Project.from({
      files: { 'index.gjs': 'a', 'nested/other.gjs': 'b' },
    });

    expect(readProject(writeProject(project))?.equals(project)).toBe(true);
  });

  it('does not mistake a JSON document for a project', () => {
    const json = '{ "not": "a project", "just": "a document" }';
    const params = new URLSearchParams({
      format: 'md',
      c: compressToEncodedURIComponent(json),
    });

    const project = readProject(params);

    expect(project?.isSingleFile).toBe(true);
    expect(project?.entry?.text).toBe(json);
  });

  it('is not fooled by an object whose values are not file contents', () => {
    const params = new URLSearchParams({
      c: compressToEncodedURIComponent('{"count": 3}'),
    });

    expect(readProject(params)?.isSingleFile).toBe(true);
  });
});

describe('serialize', () => {
  it('writes the same shape the app writes today', () => {
    const params = writeProject(Project.single(SNIPPET, { format: 'gjs' }));

    expect(params.get('format')).toBe('gjs');
    expect(decompressFromEncodedURIComponent(params.get('c') as string)).toBe(SNIPPET);
  });

  it('never writes the legacy t param', () => {
    const params = writeProject(Project.single(SNIPPET, { format: 'gjs' }), {
      into: new URLSearchParams({ t: 'stale' }),
    });

    expect(params.get('t')).toBe(null);
  });

  it('preserves params it does not own', () => {
    const params = writeProject(Project.single(SNIPPET, { format: 'gjs' }), {
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

  it('writes more than one file as an object, with no format', () => {
    const project = Project.from({ files: { 'index.gjs': 'a', 'other.gjs': 'b' } });
    const params = writeProject(project, { into: new URLSearchParams({ format: 'stale' }) });

    expect(JSON.parse(decompressFromEncodedURIComponent(params.get('c') as string))).toEqual({
      'index.gjs': 'a',
      'other.gjs': 'b',
    });
    /**
     * The file names say what each one is, so a single format would be a lie.
     * Its absence is also how reading tells a project from a document.
     */
    expect(params.get('format')).toBe(null);
  });

  it('round trips single-file projects', () => {
    const project = Project.single(SNIPPET, { format: 'hbs|ember' });

    expect(readProject(writeProject(project))?.equals(project)).toBe(true);
  });

  it('writes nothing for an empty project', () => {
    expect(writeProject(Project.empty).toString()).toBe('');
  });
});
