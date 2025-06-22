import { assert } from '@ember/debug';

import { default as FileReact } from '~icons/devicon/react?raw';
import { default as FileSvelte } from '~icons/devicon/svelte?raw';
import { default as FileVue } from '~icons/devicon/vuejs?raw';
import { default as NestedMarkdown } from '~icons/mdi/language-markdown?raw';
import { default as FileEmber } from '~icons/vscode-icons/file-type-ember?raw';
import { default as FileGlimmer } from '~icons/vscode-icons/file-type-glimmer?raw';
import { default as FileMarkdown } from '~icons/vscode-icons/file-type-markdown?raw';
import { default as FileMermaid } from '~icons/vscode-icons/file-type-mermaid?raw';

/**
 * The compiler stettings for all these are configured in routes/application.ts
 */

export const LANGUAGE = {
  gjs: {
    name: 'Glimmer JS',
    icon: <template>
      <span>{{{FileGlimmer}}}</span>
    </template>,
  },
  hbs: {
    name: 'Ember Template',
    icon: <template>
      <span>{{{FileEmber}}}</span>
    </template>,
  },
  vue: {
    name: 'Vue',
    icon: <template>
      <span>{{{FileVue}}}</span>
    </template>,
  },
  svelte: {
    name: 'Svelte',
    icon: <template>
      <span>{{{FileSvelte}}}</span>
    </template>,
  },
  'jsx|react': {
    name: 'JSX | React',
    icon: <template>
      <span>{{{FileReact}}}</span>
    </template>,
  },
  mermaid: {
    name: 'Mermaid',
    icon: <template>
      <span>{{{FileMermaid}}}</span>
    </template>,
  },
  md: {
    name: 'Markdown',
    icon: <template>
      <span>{{{FileMarkdown}}}</span>
    </template>,
  },
  gmd: {
    name: 'Glimdown',
    icon: <template>
      <span>
        <span>{{{FileGlimmer}}}</span>
        <span style="position: absolute; top: 1rem; left: 1.5rem">{{{NestedMarkdown}}}</span>
      </span>
    </template>,
  },
};

const ALIASES = {
  glimdown: 'gmd',
  gdm: 'gmd',
};
export const DEFAULT_FORMAT = 'glimdown';
export const ALLOWED_FORMATS = [
  DEFAULT_FORMAT,
  'gjs',
  'hbs',
  'svelte',
  'vue',
  'jsx',
  'mermaid',
  'gmd',
] as const;
export const ALLOWED_FLAVORS = {
  jsx: ['react'],
} as Record<string, string[]>;

function key(format: string, flavor: undefined | string) {
  const lang = flavor ? `${format}|${flavor}` : format;

  return lang;
}

export function infoFor(format: string, flavor: undefined | string) {
  const lang = flavor ? `${format}|${flavor}` : format;

  // We have to do an alias check for all the prior former styles of formats
  const info = LANGUAGE[key(format, flavor)] ?? LANGUAGE[key(ALIASES[format], flavor)];

  assert(`Could not find info for ${lang}${flavor ? ` and ${flavor}` : ''}`, info);

  return info;
}

export function iconFor(format: string, flavor: undefined | string) {
  return infoFor(format, flavor).icon;
}

export function nameFor(format: string, flavor: undefined | string) {
  return infoFor(format, flavor).name;
}

export function isAllowedFormat(x?: string | null): x is Format {
  return Boolean(x && (ALLOWED_FORMATS as readonly string[]).includes(x));
}

export function hasAllowedFormat<T extends { format?: string }>(x: T): x is T & NewContent {
  return isAllowedFormat(x.format);
}

function isAllowedFlavor(format: string, flavor: string) {
  return (ALLOWED_FLAVORS[format] ?? []).includes(flavor);
}

export function flavorFrom(format: string | null, flavor?: string | null) {
  if (!format) return;
  if (!flavor) return;

  if (isAllowedFlavor(format, flavor)) {
    return flavor;
  }

  return;
}

export function formatFrom(x: string | undefined | null): Format {
  if (isAllowedFormat(x)) {
    return x;
  }

  return DEFAULT_FORMAT;
}
