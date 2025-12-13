import { isCollection } from 'kolay';

import type { Collection, Page } from 'kolay';

export const not = (x: unknown) => !x;

export function isHidden(page: Page | Collection) {
  if (location.href.includes('showHidden')) return false;

  if (isCollection(page)) {
    return page.path.startsWith('x-');
  }

  return page.path.startsWith('/x-');
}

export function isNotHidden(page: Page | Collection) {
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
      preload(tutorial.path);

      return unprose(tutorial.path);
    }

    if (current?.path && current.path === tutorial.path) {
      found = true;
    }
  }

  return;
}

function unprose(prosePath: string | undefined) {
  if (!prosePath) return;

  return prosePath.replace(/\/prose.md$/, '');
}

/**
 * To help reduce load time between chapters, we'll load
 * the next and previous documents for each page
 */
async function preload(prosePath?: string) {
  if (!prosePath) return;

  await Promise.resolve();

  const path = unprose(prosePath);

  await Promise.all([
    fetch(`/docs/${path}/prose.md`),
    fetch(`/docs/${path}/prompt.gjs`),
    fetch(`/docs/${path}/answer.gjs`),
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
