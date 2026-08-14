export interface LiveCodeExtractionOptions {
  isLive?: (meta: string, lang: string) => boolean;
  ALLOWED_FORMATS?: string[];
  isPreview?: (meta: string) => boolean;
  isBelow?: (meta: string) => boolean;
  needsLive?: (lang: string) => boolean;
  getFlavorFromMeta?: (meta: string, lang: string) => string | undefined;
}

export interface PublicOptions {
  code?: {
    classList?: string[];
  };
  demo?: {
    classList?: string[];
  };
  headingId?: {
    /**
     * How a heading's text becomes its `id`. Defaults to kebab-case.
     *
     * Pass a `github-slugger` instance's `slug` to match the anchors GitHub
     * generates for the same markdown.
     */
    slug?: (text: string) => string;
  };
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
  compiler?: { process: (text: string) => Promise<{ data: { liveCode: Array<string> } }> };
}

export type InternalOptions = PublicOptions & LiveCodeExtractionOptions;
