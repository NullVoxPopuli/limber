export interface LiveCodeExtractionOptions {
  isLive?: (meta: string, lang: string) => boolean;
  ALLOWED_FORMATS?: string[];
  isPreview?: (meta: string) => boolean;
  isBelow?: (meta: string) => boolean;
  needsLive?: (lang: string) => boolean;
  getFlavorFromMeta?: (meta: string, lang: string) => string | undefined;
}

export interface HeadingIdOptions {
  /**
   * How a heading's text becomes its `id`.
   *
   * - `'kebab'` (default) — kebab-case, e.g. `### setupMirage` → `#setup-mirage`
   * - `'gfm'` — the anchor GitHub generates for the same markdown, e.g.
   *   `### setupMirage` → `#setupmirage`. Use this when the same `.md` is read
   *   both in a rendered site and on GitHub, so in-page links resolve in both.
   *
   * A function is also accepted for anything neither mode covers. It receives
   * the heading's text with whitespace already collapsed.
   */
  slug?: 'kebab' | 'gfm' | ((text: string) => string);
}

export interface PublicOptions {
  code?: {
    classList?: string[];
  };
  demo?: {
    classList?: string[];
  };
  headingId?: HeadingIdOptions;
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
  compiler?: { process: (text: string) => Promise<{ data: { liveCode: Array<string> } }> };
}

export type InternalOptions = PublicOptions & LiveCodeExtractionOptions;
