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
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
  compiler?: { process: (text: string) => Promise<{ data: { liveCode: Array<string> } }> };
}

export type InternalOptions = PublicOptions & LiveCodeExtractionOptions;
