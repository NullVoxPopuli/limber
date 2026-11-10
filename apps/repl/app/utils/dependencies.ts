/**
 * Package name → version or range, for imports that load from npm.
 */
export type Versions = Record<string, string>;

/**
 * The `deps` query param lists pinned packages, separated by commas.
 *
 *   deps=dompurify@3.2.0,lodash-es@^4
 *
 * An entry with no version means latest, so it is left out.
 */
export function parseDeps(value: unknown): Versions {
  const versions: Versions = {};

  if (typeof value !== 'string') return versions;

  for (const entry of value.split(',')) {
    /**
     * The first `@` of a scoped name is part of the name.
     */
    const at = entry.lastIndexOf('@');

    if (at <= 0) continue;

    const name = entry.slice(0, at).trim();
    const version = entry.slice(at + 1).trim();

    if (name && version) {
      versions[name] = version;
    }
  }

  return versions;
}

/**
 * Inverse of `parseDeps`.
 * No pins gives `undefined`, which removes the query param.
 */
export function serializeDeps(versions: Versions): string | undefined {
  const entries = Object.entries(versions).map(([name, version]) => `${name}@${version}`);

  return entries.length ? entries.join(',') : undefined;
}
