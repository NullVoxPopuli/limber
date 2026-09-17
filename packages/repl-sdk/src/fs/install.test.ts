import { beforeEach, describe, expect, it } from 'vitest';

import { Installer } from './install.js';
import { maxSatisfying, satisfiesRange } from './semver.js';

import type { InstalledPackage } from '../types.js';

/**
 * A package graph the way npm would describe it, so the resolution algorithm
 * can be tested without the network or the worker.
 */
const REGISTRY: Record<string, InstalledPackage['manifest']> = {
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

let asked: string[] = [];
let installs: string[] = [];
let stored: Record<string, string[]> = {};
let links: Record<string, string> = {};
let scopes: Record<string, Record<string, string>>;
let installer: Installer;

function fakeWorker() {
  return {
    install: fakeInstall,
    installed: () => Promise.resolve(stored),
    links: () => Promise.resolve({ ...links }),
    link: (name: string, version: string) => {
      links[name] = version;

      return Promise.resolve();
    },
  };
}

/**
 * What the worker would answer: the manifest and file list of the version
 * the registry picks for a range, or the version itself when it is exact.
 */
function fakeInstall(name: string, range: string): Promise<InstalledPackage> {
  asked.push(`${name}@${range}`);

  const published = PUBLISHED[name] ?? [];
  const version =
    range === 'latest'
      ? published[published.length - 1]
      : published.includes(range)
        ? range
        : maxSatisfying(published, range);

  const manifest = REGISTRY[`${name}@${version}`];

  if (!manifest) return Promise.reject(new Error(`no such package ${name}@${range}`));

  installs.push(`${name}@${version}`);

  return Promise.resolve({ manifest, files: new Set(['index.js', 'package.json']) });
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
  asked = [];
  installs = [];
  stored = {};
  links = {};
  scopes = {};
  installer = new Installer({
    worker: fakeWorker(),
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

describe('install', () => {
  it('names the file the entry point resolved to', async () => {
    const result = await installer.install('app');

    expect(result).toEqual({
      specifier: 'app',
      url: 'file:///node_modules/.deps/app@1.0.0/index.js',
      name: 'app',
      version: '1.0.0',
    });
    expect(installer.imports).toEqual({ app: 'file:///node_modules/.deps/app@1.0.0/index.js' });
  });

  it('treats a file the package has as already resolved', async () => {
    await installer.install('app');

    expect(await installer.resolveUrl('file:///node_modules/.deps/app@1.0.0/index.js')).toBe(
      'file:///node_modules/.deps/app@1.0.0/index.js'
    );
    expect(installs).toEqual(['app@1.0.0']);
  });

  it('ignores URLs outside node_modules', async () => {
    expect(await installer.resolveUrl('file:///src/index.gjs')).toBeUndefined();
  });
});

describe('dependency scopes', () => {
  it('scopes each package to the versions its own package.json asked for', async () => {
    await installer.install('app');
    await installer.resolveUrl('file:///node_modules/left@%5E1.0.0');

    expect(scopes['file:///node_modules/.deps/app@1.0.0/']).toMatchObject({
      left: 'file:///node_modules/left@%5E1.0.0',
      right: 'file:///node_modules/right@%5E1.0.0',
    });
    expect(scopes['file:///node_modules/.deps/left@1.0.0/']).toMatchObject({
      shared: 'file:///node_modules/shared@%5E1.2.0',
    });
  });

  it('maps the subpath prefix too, so deep imports keep the version', async () => {
    await installer.install('app');

    expect(scopeFor('file:///node_modules/.deps/app@1.0.0/')['left/']).toBe(
      'file:///node_modules/left@%5E1.0.0/'
    );
  });

  it('never scopes a peerDependency', async () => {
    await installer.resolveUrl('file:///node_modules/left@%5E1.0.0');

    const scope = scopeFor('file:///node_modules/.deps/left@1.0.0/');

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
    const fromLeft = await installer.resolveUrl('file:///node_modules/shared@%5E1.2.0');
    const fromRight = await installer.resolveUrl('file:///node_modules/shared@%5E1.5.0');

    expect(fromLeft).toBe('file:///node_modules/.deps/shared@1.9.0/index.js');
    expect(fromRight).toBe(fromLeft);
    expect(installs.filter((d) => d.startsWith('shared@'))).toEqual(['shared@1.9.0']);
  });

  it('keeps separate copies across a major', async () => {
    await installer.resolveUrl('file:///node_modules/legacy@%5E1.0.0');
    await installer.resolveUrl('file:///node_modules/legacy@%5E2.0.0');

    expect(installs.filter((d) => d.startsWith('legacy@'))).toEqual([
      'legacy@1.0.0',
      'legacy@2.1.0',
    ]);
    expect(await installer.resolveUrl('file:///node_modules/.deps/legacy@1.0.0/index.js')).toBe(
      'file:///node_modules/.deps/legacy@1.0.0/index.js'
    );
    expect(await installer.resolveUrl('file:///node_modules/.deps/legacy@2.1.0/index.js')).toBe(
      'file:///node_modules/.deps/legacy@2.1.0/index.js'
    );
  });
});

describe('what storage already has', () => {
  it('asks for the stored version by exact number instead of the range', async () => {
    stored = { legacy: ['1.0.0', '2.1.0'] };

    const { version } = await installer.install('legacy@^2.0.0');

    expect(version).toBe('2.1.0');
    expect(asked).toEqual(['legacy@2.1.0']);
  });

  it('asks for the range when nothing stored satisfies it', async () => {
    stored = { legacy: ['1.0.0'] };

    const { version } = await installer.install('legacy@^2.0.0');

    expect(version).toBe('2.1.0');
    expect(asked).toEqual(['legacy@^2.0.0']);
  });

  it('asks the worker what is stored once', async () => {
    let listed = 0;

    installer = new Installer({
      worker: {
        ...fakeWorker(),
        installed: () => {
          listed += 1;

          return Promise.resolve({ shared: ['1.9.0'] });
        },
      },
      addImportMap: () => {},
    });

    await installer.install('shared@^1.2.0');
    await installer.install('legacy@^1.0.0');

    expect(asked).toEqual(['shared@1.9.0', 'legacy@^1.0.0']);
    expect(listed).toBe(1);
  });
});

describe('links', () => {
  it('links the first version a name resolves to', async () => {
    await installer.resolveUrl('file:///node_modules/legacy@%5E2.0.0');
    await installer.resolveUrl('file:///node_modules/legacy@%5E1.0.0');

    expect(links).toEqual({ legacy: '2.1.0' });
  });

  it('means the linked version when no version is asked for', async () => {
    links = { legacy: '1.0.0' };

    const { version } = await installer.install('legacy');

    expect(version).toBe('1.0.0');
    expect(asked).toEqual(['legacy@1.0.0']);
  });

  it('does not let a link answer for an explicit range', async () => {
    links = { legacy: '1.0.0' };

    const { version } = await installer.install('legacy@^2.0.0');

    expect(version).toBe('2.1.0');
    expect(links).toEqual({ legacy: '1.0.0' });
  });
});
