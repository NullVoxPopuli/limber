import { compare, satisfies } from 'compare-versions';

/**
 * Ranges npm accepts and compare-versions does not (git urls, `workspace:*`,
 * a dist-tag) are not a match, and not a crash.
 *
 * @param {string} version
 * @param {string} range
 * @returns {boolean}
 */
export function satisfiesRange(version, range) {
  if (version === range) return true;

  try {
    return satisfies(version, range);
  } catch {
    return false;
  }
}

/**
 * The highest published version a range accepts.
 *
 * Prereleases are excluded unless the range itself names one, which is what
 * npm does.
 *
 * @param {string[]} versions
 * @param {string} range
 * @returns {string | undefined}
 */
export function maxSatisfying(versions, range) {
  const allowPrerelease = range.includes('-');

  /** @type {string | undefined} */
  let best;

  for (const version of versions) {
    if (!allowPrerelease && version.includes('-')) continue;

    try {
      if (!satisfies(version, range)) continue;
    } catch {
      /**
       * Ranges npm accepts and compare-versions does not, such as a git url
       * or `workspace:*`. Not a match, not a crash.
       */
      continue;
    }

    if (!best || compare(version, best, '>')) best = version;
  }

  return best;
}
