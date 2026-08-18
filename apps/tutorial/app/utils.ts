import { isPageTree } from 'kolay';

import type { Page, PageTree } from 'kolay';

export const not = (x: unknown) => !x;

/**
 * The manifest's page paths live under the 'docs' group
 * (e.g. /docs/1-introduction/1-basics/prose.md), but the app's URLs are
 * the lesson directories at the root (e.g. /1-introduction/1-basics) —
 * the group is mounted at the root via addRoutes(this, 'docs').
 */
export function lessonPath(item: Page | PageTree): string {
  return item.appRelativePath
    .replace(/^\/docs/, '')
    .replace(/\/prose\.md$/, '');
}

/**
 * keyed-each-blocks is only shown in dev builds.
 * Pending: https://github.com/emberjs/ember.js/issues/20419
 */
const isProdOnlyHidden = (path: string) =>
  import.meta.env.PROD && path.includes('keyed-each-blocks');

export function isHidden(page: Page | PageTree) {
  // Only lesson directories (via their prose.md) are tutorial entries.
  // Stray .md files next to the lesson directories have no prompt/answer
  // and never had manifest entries before the kolay rework.
  if (!isPageTree(page) && !page.path.endsWith('/prose.md')) return true;

  if (location.href.includes('showHidden')) return false;

  const path = isPageTree(page) ? page.path : lessonPath(page);

  return (
    path.split('/').some((segment) => segment.startsWith('x-')) ||
    isProdOnlyHidden(path)
  );
}

export function isNotHidden(page: Page | PageTree) {
  return !isHidden(page);
}

export function nextPage(
  pages: Page[],
  current: Page | undefined
): string | undefined {
  let found = false;

  for (const tutorial of pages) {
    if (isHidden(tutorial)) {
      continue;
    }

    if (found) {
      preload(lessonPath(tutorial));

      return lessonPath(tutorial);
    }

    if (current?.path && current.path === tutorial.path) {
      found = true;
    }
  }

  return;
}

/**
 * To help reduce load time between chapters, we'll load
 * the next and previous documents for each page
 */
async function preload(path?: string) {
  if (!path) return;

  await Promise.resolve();

  await Promise.all([
    fetch(`/docs${path}/prose.md`),
    fetch(`/docs${path}/prompt.gjs`),
    fetch(`/docs${path}/answer.gjs`),
  ]);
}

/**
 * Converts 1-2-hyphenated-thing
 * to
 *   Hyphenated Thing
 */
export function titleize(str: string) {
  return str
    .split('-')
    .filter((text) => !text.match(/^[\d]+$/))
    .map(
      (text) => `${text[0]?.toLocaleUpperCase()}${text.slice(1, text.length)}`
    )
    .join(' ');
}
