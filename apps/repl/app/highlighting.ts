import type { HighlighterGeneric } from 'shiki';

export async function getHighlighter(): Promise<HighlighterGeneric<never, never>> {
  const result = await cachedLoad();

  return result.highlighter;
}

export async function getHighlighting() {
  return cachedLoad();
}

let promise: ReturnType<typeof load>;
let result: Awaited<typeof promise>;

async function cachedLoad() {
  if (promise) {
    await promise;
  }

  if (result) return result;

  promise = load();
  result = await promise;

  return result;
}

async function load() {
  const { rehypePlugin, loadHighlighter } = await import('./lazy/shiki.ts');

  return {
    rehypePlugin,
    highlighter: await loadHighlighter(),
  };
}
