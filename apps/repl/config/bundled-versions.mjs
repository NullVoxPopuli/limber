import { readFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ID = 'virtual:bundled-versions';
const RESOLVED_ID = `\0${ID}`;

const here = dirname(fileURLToPath(import.meta.url));

/**
 * The packages that can bundle a module for the REPL:
 *
 * - the app, through its import map
 * - ember-repl, through its known modules
 * - repl-sdk, for its compilers
 */
const owners = [
  join(here, '..'),
  join(here, '../../../packages/ember-repl'),
  join(here, '../../../packages/repl-sdk'),
];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Package name → installed version, for every dependency of the owners.
 * The first owner that has a package wins, so the app's copy is listed.
 */
function installedVersions() {
  const versions = {};

  for (const dir of owners) {
    const manifest = readJson(join(dir, 'package.json'));
    const names = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies });

    for (const name of names) {
      if (name in versions) continue;

      try {
        const pkgDir = realpathSync(join(dir, 'node_modules', name));

        versions[name] = readJson(join(pkgDir, 'package.json')).version;
      } catch {
        /**
         * Not installed for this owner, for example an optional dependency.
         */
      }
    }
  }

  return versions;
}

/**
 * `import versions from 'virtual:bundled-versions'`
 * gives the installed version of each package that the REPL can bundle.
 */
export function bundledVersions() {
  return {
    name: 'bundled-versions',
    resolveId(id) {
      if (id === ID) return RESOLVED_ID;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;

      return `export default ${JSON.stringify(installedVersions())};`;
    },
  };
}
