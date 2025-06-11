import type { Plugin } from 'unified';

export interface LiveCodeExtractionOptions {
  isLive?: (meta: string, lang: string) => boolean;
  ALLOWED_FORMATS?: string[];
  isPreview?: (meta: string) => boolean;
  isBelow?: (meta: string) => boolean;
  needsLive?: (lang: string) => boolean;
}

export interface PublicOptions {
  code?: {
    classList?: string[];
  };
  demo?: {
    classList?: string[];
  };
  remarkPlugins?: Plugin[];
  rehypePlugins?: Plugin[];
}

export type InternalOptions = PublicOptions & LiveCodeExtractionOptions;
