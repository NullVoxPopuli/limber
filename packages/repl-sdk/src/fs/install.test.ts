import { beforeEach, describe, expect, it } from 'vitest';

import { Installer } from './install.js';
import { maxSatisfying, satisfiesRange } from './semver.js';
import { VFS } from './vfs.js';

import type { UntarredPackage } from '../types.js';

/**
 * A package graph the way npm would describe it, so the resolution algorithm
 * can be tested without the network.
 */
const REGISTRY: Record<string, UntarredPackage['manifest'] & { files?: string[] }> = {
  'app@1.0.0': {
    name: 'app',
    version: '1.0.0',
    exports: './index.js',
    dependencies: { left: '^1.0.0', right: '^1.0.0' },
  },
  'left@1.0.0': {
    name: 'left',
    version: '1.0.0',
    exports: './index.js',
    dependencies: { shared: '^1.2.0' },
    peerDependencies: { host: '^3.0.0' },
  },
  'right@1.0.0': {
    name: 'right',
    version: '1.0.0',
    exports: './index.js',
    /**
     * A range that overlaps left's, and a major that does not.
     */
    dependencies: { shared: '^1.5.0', legacy: '^2.0.0' },
  },
  'shared@1.9.0': { name: 'shared', version: '1.9.0', exports: './index.js' },
  'legacy@1.0.0': { name: 'legacy', version: '1.0.0', exports: './index.js' },
  'legacy@2.1.0': { name: 'legacy', version: '2.1.0', exports: './index.js' },
};

const PUBLISHED: Record<string, string[]> = {
  app: ['1.0.0'],
  left: ['1.0.0'],
  right: ['1.0.0'],
  shared: ['1.0.0', '1.2.0', '1.5.0', '1.9.0', '2.0.0'],
  legacy: ['1.0.0', '2.1.0'],
};

let downloads: string[] = [];
let scopes: Record<string, Record<string, string>>;
let vfs: VFS;
let installer: Installer;

function fakeGetTar(name: string, range: string): Promise<UntarredPackage> {
  const published = PUBLISHED[name] ?? [];
  const version =
    range === 'latest'
      ? published[published.length - 1]
      : published.includes(range)
        ? range
        : maxSatisfying(published, range);

  const manifest = REGISTRY[`${name}@${version}`];

  if (!manifest) throw new Error(`no such package ${name}@${range}`);

  downloads.push(`${name}@${version}`);

  return Promise.resolve({
    manifest,
    files: ['index.js', 'package.json'],
    contents: {
      'index.js': { text: `export const who = '${name}@${version}';` },
      'package.json': { text: JSON.stringify(manifest) },
    },
  } as unknown as UntarredPackage);
}

function published(name: string) {
  const versions = PUBLISHED[name];

  if (!versions) throw new Error(`no versions for ${name}`);

  return versions;
}

function scopeFor(url: string) {
  const scope = scopes[url];

  if (!scope) throw new Error(`no scope registered for ${url}`);

  return scope;
}

beforeEach(() => {
  downloads = [];
  scopes = {};
  vfs = new VFS();
  installer = new Installer({
    vfs,
    getTar: fakeGetTar,
    addImportMap: (map: { scopes?: Record<string, Record<string, string>> }) => {
      Object.assign(scopes, map.scopes);
    },
  });
});

describe('semver', () => {
  it('picks the highest match', () => {
    expect(maxSatisfying(published('shared'), '^1.2.0')).toBe('1.9.0');
    expect(maxSatisfying(published('shared'), '~1.2.0')).toBe('1.2.0');
    expect(maxSatisfying(published('shared'), '^2.0.0')).toBe('2.0.0');
  });

  it('ignores prereleases unless the range asks', () => {
    expect(maxSatisfying(['1.0.0', '2.0.0-beta.1'], '>=1.0.0')).toBe('1.0.0');
    expect(maxSatisfying(['1.0.0', '2.0.0-beta.1'], '>=2.0.0-beta.0')).toBe('2.0.0-beta.1');
  });

  it('treats a range it cannot parse as no match rather than throwing', () => {
    expect(satisfiesRange('1.0.0', 'workspace:*')).toBe(false);
    expect(satisfiesRange('1.0.0', 'github:someone/thing')).toBe(false);
    expect(satisfiesRange('1.0.0', 'latest')).toBe(false);
  });
});

describe('dependency scopes', () => {
  it('scopes each package to the versions its own package.json asked for', async () => {
    await installer.install('app');
    await installer.resolveUrl('file:///npm/left@%5E1.0.0');

    expect(scopes['file:///npm/app@1.0.0/']).toMatchObject({
      left: 'file:///npm/left@%5E1.0.0',
      right: 'file:///npm/right@%5E1.0.0',
    });

    expect(scopes['file:///npm/left@1.0.0/']).toMatchObject({
      shared: 'file:///npm/shared@%5E1.2.0',
    });
  });

  it('maps the subpath prefix too, so deep imports keep the version', async () => {
    await installer.install('app');

    expect(scopeFor('file:///npm/app@1.0.0/')['left/']).toBe('file:///npm/left@%5E1.0.0/');
  });

  it('never scopes a peerDependency', async () => {
    await installer.resolveUrl('file:///npm/left@%5E1.0.0');

    const scope = scopeFor('file:///npm/left@1.0.0/');

    expect(scope.shared).toBeTruthy();
    /**
     * Absent on purpose. A name a scope does not claim falls through to the
     * enclosing scope and then the top-level imports, which is how a peer ends
     * up on whatever copy its dependent already has.
     */
    expect(scope.host).toBeUndefined();
  });
});

describe('reuse', () => {
  it('shares one copy between two overlapping ranges', async () => {
    const fromLeft = await installer.resolveUrl('file:///npm/shared@%5E1.2.0');
    const fromRight = await installer.resolveUrl('file:///npm/shared@%5E1.5.0');

    expect(fromLeft).toBe('file:///npm/shared@1.9.0/index.js');
    expect(fromRight).toBe(fromLeft);
    expect(downloads.filter((d) => d.startsWith('shared@'))).toEqual(['shared@1.9.0']);
  });

  it('keeps separate copies across a major', async () => {
    await installer.resolveUrl('file:///npm/legacy@%5E1.0.0');
    await installer.resolveUrl('file:///npm/legacy@%5E2.0.0');

    expect(downloads.filter((d) => d.startsWith('legacy@'))).toEqual([
      'legacy@1.0.0',
      'legacy@2.1.0',
    ]);
    expect(vfs.has('file:///npm/legacy@1.0.0/index.js')).toBe(true);
    expect(vfs.has('file:///npm/legacy@2.1.0/index.js')).toBe(true);
  });
});
